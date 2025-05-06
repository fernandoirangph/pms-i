<?php
// App/Http/Controllers/ProjectController.php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ProjectController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if ($user->role === 'admin') {
            $projects = Project::with('manager')->get();
        } elseif ($user->role === 'project_manager') {
            $projects = Project::where('manager_id', $user->id)->with('manager')->get();
        } else {
            // For team members, get projects they are assigned to via tasks
            $projects = Project::whereHas('tasks.users', function ($query) use ($user) {
                $query->where('users.id', $user->id);
            })->with('manager')->get();
        }

        return response()->json($projects);
    }

    public function store(Request $request)
    {
        // Validate the incoming request
        $validatedData = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('projects', 'name') // Ensure the project name is unique
            ],
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'budget' => 'required|numeric|min:0',
            'status' => 'required|in:not_started,in_progress,on_hold,completed,cancelled',
        ]);

        // Automatically set the created_by field to the authenticated user's ID
        $validatedData['manager_id'] = Auth::id();

        // Create the project using the validated data
        $project = Project::create($validatedData);

        // Return the created project as a JSON response
        return response()->json($project, 201);
    }

    public function show($id)
    {
        $project = Project::with(['manager', 'tasks.users'])->find($id);

        if (!$project) {
            return response()->json(['error' => 'Project not found'], 404);
        }

        return response()->json([
            'project' => $project->only(['name', 'description', 'status', 'start_date', 'end_date', 'budget']),
            'tasks' => $project->tasks,
        ]);
    }

    public function update(Request $request, $id)
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json(['error' => 'Project not found'], 404);
        }

        // Check if the authenticated user is the project manager or an admin
        if (Auth::user()->id !== $project->manager_id && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Validate the incoming request
        $validatedData = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
            'budget' => 'sometimes|required|numeric|min:0',
            'actual_cost' => 'sometimes|required|numeric|min:0',
            'status' => 'sometimes|required|in:not_started,in_progress,on_hold,completed,cancelled',
        ]);

        $project->update($validatedData);

        return response()->json($project);
    }

    public function destroy(Project $project)
    {
        if (Auth::user()->id !== $project->manager_id && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $project->delete();
        return response()->json(null, 204);
    }

    public function getProjectManagers()
    {
        $projectManagers = User::where('role', 'project_manager')->get();
        return response()->json($projectManagers);
    }

    public function getProjectStats(Project $project)
    {
        $taskStats = [
            'total' => $project->tasks->count(),
            'not_started' => $project->tasks->where('status', 'not_started')->count(),
            'in_progress' => $project->tasks->where('status', 'in_progress')->count(),
            'review' => $project->tasks->where('status', 'review')->count(),
            'completed' => $project->tasks->where('status', 'completed')->count(),
        ];

        $priorityStats = [
            'low' => $project->tasks->where('priority', 'low')->count(),
            'medium' => $project->tasks->where('priority', 'medium')->count(),
            'high' => $project->tasks->where('priority', 'high')->count(),
            'urgent' => $project->tasks->where('priority', 'urgent')->count(),
        ];

        $timeStats = [
            'estimated_hours' => $project->tasks->sum('estimated_hours'),
            'actual_hours' => $project->tasks->sum('actual_hours'),
        ];

        return response()->json([
            'task_stats' => $taskStats,
            'priority_stats' => $priorityStats,
            'time_stats' => $timeStats,
            'budget' => $project->budget,
            'actual_cost' => $project->actual_cost,
            'progress' => $project->progress,
        ]);
    }
}
