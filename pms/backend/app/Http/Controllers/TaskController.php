<?php
// App/Http/Controllers/TaskController.php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $projectId = $request->query('project_id');

        if ($projectId) {
            if ($user->role === 'admin' || $user->role === 'project_manager') {
                $tasks = Task::where('project_id', $projectId)
                    ->with(['users', 'project'])
                    ->get();
            } else {
                $tasks = Task::where('project_id', $projectId)
                    ->whereHas('users', function ($query) use ($user) {
                        $query->where('users.id', $user->id);
                    })
                    ->with(['users', 'project'])
                    ->get();
            }
        } else {
            if ($user->role === 'admin') {
                $tasks = Task::with(['users', 'project'])->get();
            } elseif ($user->role === 'project_manager') {
                $tasks = Task::whereHas('project', function ($query) use ($user) {
                    $query->where('manager_id', $user->id);
                })
                    ->with(['users', 'project'])
                    ->get();
            } else {
                $tasks = $user->tasks()->with('project')->get();
            }
        }

        return response()->json($tasks);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'required|in:not_started,in_progress,review,completed',
            'priority' => 'required|in:low,medium,high,urgent',
            'estimated_hours' => 'required|numeric|min:0',
            'project_id' => 'required|exists:projects,id',
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
        ]);

        $task = Task::create($request->except('user_ids'));
        $task->users()->attach($request->user_ids);

        // Create notifications for assigned users
        foreach ($request->user_ids as $userId) {
            Notification::create([
                'title' => 'New Task Assignment',
                'message' => "You have been assigned to a new task: {$task->name}",
                'user_id' => $userId,
                'link' => "/tasks/{$task->id}",
            ]);
        }

        return response()->json($task->load('users'), 201);
    }

    public function show(Task $task)
    {
        return response()->json($task->load(['users', 'project', 'comments.user', 'timeLogs']));
    }

    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id);

        // Check if the user is authorized to update the task
        if (Auth::user()->cannot('update', $task)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
            'status' => 'sometimes|required|in:not_started,in_progress,review,completed',
            'priority' => 'sometimes|required|in:low,medium,high,urgent',
            'estimated_hours' => 'sometimes|required|numeric|min:0',
            'actual_hours' => 'sometimes|required|numeric|min:0',
            'project_id' => 'sometimes|required|exists:projects,id',
            'user_ids' => 'sometimes|required|array',
            'user_ids.*' => 'exists:users,id',
        ]);

        $oldStatus = $task->status;
        $task->update($request->except('user_ids'));

        if ($request->has('user_ids')) {
            // Find which users are newly assigned
            $existingUserIds = $task->users->pluck('id')->toArray();
            $newUserIds = array_diff($request->user_ids, $existingUserIds);

            $task->users()->sync($request->user_ids);

            // Create notifications for newly assigned users
            foreach ($newUserIds as $userId) {
                Notification::create([
                    'title' => 'New Task Assignment',
                    'message' => "You have been assigned to task: {$task->name}",
                    'user_id' => $userId,
                    'link' => "/tasks/{$task->id}",
                ]);
            }
        }

        // If status changed to completed, notify project manager
        if ($oldStatus !== 'completed' && $task->status === 'completed') {
            $projectManagerId = $task->project->manager_id;

            Notification::create([
                'title' => 'Task Completed',
                'message' => "Task '{$task->name}' has been marked as completed.",
                'user_id' => $projectManagerId,
                'link' => "/tasks/{$task->id}",
            ]);
        }

        return response()->json($task->load('users'));
    }
}
    public function destroy($id)
    {
        $task = Task::findOrFail($id);
        $task->delete();
        return response()->json(null, 204);
    }

    public function getUsers()
    {
        $users = User::where('role', 'team_member')->get();
        return response()->json($users);
    }
}
