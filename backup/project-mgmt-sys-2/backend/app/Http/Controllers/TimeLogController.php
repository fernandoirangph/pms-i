<?php
// App/Http/Controllers/TimeLogController.php

namespace App\Http\Controllers;

use App\Models\TimeLog;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TimeLogController extends Controller
{
    public function index(Request $request)
    {
        $taskId = $request->query('task_id');
        $userId = $request->query('user_id');

        $query = TimeLog::query();

        if ($taskId) {
            $query->where('task_id', $taskId);
        }

        if ($userId) {
            $query->where('user_id', $userId);
        } else {
            // If no specific user requested, only show the current user's logs
            // unless admin or project manager
            $user = Auth::user();
            if ($user->role !== 'admin' && $user->role !== 'project_manager') {
                $query->where('user_id', $user->id);
            }
        }

        $timeLogs = $query->with(['user', 'task'])->orderBy('start_time', 'desc')->get();

        return response()->json($timeLogs);
    }

    public function store(Request $request)
    {
        $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'start_time' => 'required|date',
            'end_time' => 'nullable|date|after:start_time',
            'hours' => 'required_without:end_time|numeric|min:0',
            'description' => 'nullable|string',
        ]);

        $user = Auth::user();

        // Check if user is assigned to the task
        $task = Task::find($request->task_id);
        $userAssigned = $task->users->contains($user->id);

        if (!$userAssigned && $user->role !== 'admin' && $user->role !== 'project_manager') {
            return response()->json(['error' => 'You are not assigned to this task'], 403);
        }

        // Calculate hours if end_time is provided but hours is not
        $hours = $request->hours;
        if ($request->end_time && !$request->hours) {
            $startTime = new \DateTime($request->start_time);
            $endTime = new \DateTime($request->end_time);
            $interval = $startTime->diff($endTime);
            $hours = $interval->h + ($interval->i / 60);
        }

        $timeLog = TimeLog::create([
            'user_id' => $user->id,
            'task_id' => $request->task_id,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'description' => $request->description,
            'hours' => $hours,
        ]);

        // Update the task's actual hours
        $task->actual_hours = $task->timeLogs->sum('hours');
        $task->save();

        return response()->json($timeLog->load(['task', 'user']), 201);
    }

    public function update(Request $request, TimeLog $timeLog)
    {
        $user = Auth::user();

        // Check if user owns this time log or is admin
        if ($timeLog->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'start_time' => 'sometimes|required|date',
            'end_time' => 'nullable|date|after:start_time',
            'hours' => 'sometimes|required_without:end_time|numeric|min:0',
            'description' => 'nullable|string',
        ]);

        // Calculate hours if end_time is provided but hours is not
        $hours = $request->hours ?? $timeLog->hours;
        if ($request->end_time && !$request->has('hours')) {
            $startTime = new \DateTime($request->start_time ?? $timeLog->start_time);
            $endTime = new \DateTime($request->end_time);
            $interval = $startTime->diff($endTime);
            $hours = $interval->h + ($interval->i / 60);
        }

        $timeLog->update([
            'start_time' => $request->start_time ?? $timeLog->start_time,
            'end_time' => $request->end_time ?? $timeLog->end_time,
            'description' => $request->description ?? $timeLog->description,
            'hours' => $hours,
        ]);

        // Update the task's actual hours
        $task = $timeLog->task;
        $task->actual_hours = $task->timeLogs->sum('hours');
        $task->save();

        return response()->json($timeLog->load(['task', 'user']));
    }

    public function destroy(TimeLog $timeLog)
    {
        $user = Auth::user();

        // Check if user owns this time log or is admin
        if ($timeLog->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $task = $timeLog->task;
        $timeLog->delete();

        // Update the task's actual hours
        $task->actual_hours = $task->timeLogs->sum('hours');
        $task->save();

        return response()->json(null, 204);
    }
}
