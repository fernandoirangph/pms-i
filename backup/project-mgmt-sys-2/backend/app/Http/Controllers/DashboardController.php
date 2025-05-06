<?php
// App/Http/Controllers/DashboardController.php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function getAdminStats()
    {
        // Check if user is admin
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $totalProjects = Project::count();
        $activeProjects = Project::where('status', 'in_progress')->count();
        $completedProjects = Project::where('status', 'completed')->count();
        $totalTasks = Task::count();
        $completedTasks = Task::where('status', 'completed')->count();
        $totalUsers = User::count();

        // Projects by status
        $projectsByStatus = [
            'not_started' => Project::where('status', 'not_started')->count(),
            'in_progress' => Project::where('status', 'in_progress')->count(),
            'on_hold' => Project::where('status', 'on_hold')->count(),
            'completed' => Project::where('status', 'completed')->count(),
            'cancelled' => Project::where('status', 'cancelled')->count(),
        ];

        // Tasks by status
        $tasksByStatus = [
            'not_started' => Task::where('status', 'not_started')->count(),
            'in_progress' => Task::where('status', 'in_progress')->count(),
            'review' => Task::where('status', 'review')->count(),
            'completed' => Task::where('status', 'completed')->count(),
        ];

        // Tasks by priority
        $tasksByPriority = [
            'low' => Task::where('priority', 'low')->count(),
            'medium' => Task::where('priority', 'medium')->count(),
            'high' => Task::where('priority', 'high')->count(),
            'urgent' => Task::where('priority', 'urgent')->count(),
        ];

        // Users by role
        $usersByRole = [
            'admin' => User::where('role', 'admin')->count(),
            'project_manager' => User::where('role', 'project_manager')->count(),
            'team_member' => User::where('role', 'team_member')->count(),
            'client' => User::where('role', 'client')->count(),
        ];

        // Recent projects
        $recentProjects = Project::orderBy('created_at', 'desc')
            ->limit(5)
            ->with('manager')
            ->get();

        // Upcoming deadlines
        $upcomingDeadlines = Task::where('end_date', '>=', Carbon::now())
            ->where('end_date', '<=', Carbon::now()->addDays(7))
            ->where('status', '!=', 'completed')
            ->with('project')
            ->orderBy('end_date')
            ->limit(5)
            ->get();

        return response()->json([
            'total_projects' => $totalProjects,
            'active_projects' => $activeProjects,
            'completed_projects' => $completedProjects,
            'total_tasks' => $totalTasks,
            'completed_tasks' => $completedTasks,
            'total_users' => $totalUsers,
            'projects_by_status' => $projectsByStatus,
            'tasks_by_status' => $tasksByStatus,
            'tasks_by_priority' => $tasksByPriority,
            'users_by_role' => $usersByRole,
            'recent_projects' => $recentProjects,
            'upcoming_deadlines' => $upcomingDeadlines,
        ]);
    }

    public function getManagerStats()
    {
        $user = Auth::user();
        if ($user->role !== 'project_manager' && $user->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Get projects managed by this user
        $projects = Project::where('manager_id', $user->id)->get();
        $projectIds = $projects->pluck('id')->toArray();

        // Projects by status
        $projectsByStatus = [
            'not_started' => $projects->where('status', 'not_started')->count(),
            'in_progress' => $projects->where('status', 'in_progress')->count(),
            'on_hold' => $projects->where('status', 'on_hold')->count(),
            'completed' => $projects->where('status', 'completed')->count(),
            'cancelled' => $projects->where('status', 'cancelled')->count(),
        ];

        // Tasks for managed projects
        $tasks = Task::whereIn('project_id', $projectIds)->get();

        // Tasks by status
        $tasksByStatus = [
            'not_started' => $tasks->where('status', 'not_started')->count(),
            'in_progress' => $tasks->where('status', 'in_progress')->count(),
            'review' => $tasks->where('status', 'review')->count(),
            'completed' => $tasks->where('status', 'completed')->count(),
        ];

        // Tasks by priority
        $tasksByPriority = [
            'low' => $tasks->where('priority', 'low')->count(),
            'medium' => $tasks->where('priority', 'medium')->count(),
            'high' => $tasks->where('priority', 'high')->count(),
            'urgent' => $tasks->where('priority', 'urgent')->count(),
        ];

        // Budget summary
        $budgetSummary = [
            'total_budget' => $projects->sum('budget'),
            'total_actual_cost' => $projects->sum('actual_cost'),
        ];

        // Recent activities
        $recentTasks = Task::whereIn('project_id', $projectIds)
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->with(['project', 'users'])
            ->get();

        // Upcoming deadlines
        $upcomingDeadlines = Task::whereIn('project_id', $projectIds)
            ->where('end_date', '>=', Carbon::now())
            ->where('end_date', '<=', Carbon::now()->addDays(7))
            ->where('status', '!=', 'completed')
            ->with('project')
            ->orderBy('end_date')
            ->limit(5)
            ->get();

        return response()->json([
            'total_projects' => $projects->count(),
            'active_projects' => $projects->whereIn('status', ['in_progress', 'not_started'])->count(),
            'projects_by_status' => $projectsByStatus,
            'total_tasks' => $tasks->count(),
            'completed_tasks' => $tasks->where('status', 'completed')->count(),
            'tasks_by_status' => $tasksByStatus,
            'tasks_by_priority' => $tasksByPriority,
            'budget_summary' => $budgetSummary,
            'recent_tasks' => $recentTasks,
            'upcoming_deadlines' => $upcomingDeadlines,
        ]);
    }

    public function getTeamMemberStats()
    {
        $user = Auth::user();

        // Get tasks assigned to this user
        $tasks = $user->tasks;

        // Tasks by status
        $tasksByStatus = [
            'not_started' => $tasks->where('status', 'not_started')->count(),
            'in_progress' => $tasks->where('status', 'in_progress')->count(),
            'review' => $tasks->where('status', 'review')->count(),
            'completed' => $tasks->where('status', 'completed')->count(),
        ];

        // Tasks by priority
        $tasksByPriority = [
            'low' => $tasks->where('priority', 'low')->count(),
            'medium' => $tasks->where('priority', 'medium')->count(),
            'high' => $tasks->where('priority', 'high')->count(),
            'urgent' => $tasks->where('priority', 'urgent')->count(),
        ];

        // Projects the user is involved in
        $projectIds = $tasks->pluck('project_id')->unique();
        $projects = Project::whereIn('id', $projectIds)->get();

        // Time logged this week
        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();

        $timeLogsThisWeek = $user->timeLogs()
            ->whereBetween('start_time', [$startOfWeek, $endOfWeek])
            ->get();

        $hoursLoggedThisWeek = $timeLogsThisWeek->sum('hours');

        // Upcoming deadlines
        $upcomingDeadlines = $tasks->filter(function ($task) {
            $endDate = Carbon::parse($task->end_date);
            return $endDate->isFuture() &&
                $endDate->diffInDays(Carbon::now()) <= 7 &&
                $task->status !== 'completed';
        })->sortBy('end_date')->take(5)->values();

        return response()->json([
            'total_tasks' => $tasks->count(),
            'completed_tasks' => $tasks->where('status', 'completed')->count(),
            'tasks_by_status' => $tasksByStatus,
            'tasks_by_priority' => $tasksByPriority,
            'projects_count' => $projects->count(),
            'hours_logged_this_week' => $hoursLoggedThisWeek,
            'upcoming_deadlines' => $upcomingDeadlines->load('project'),
        ]);
    }

    public function getDashboardData()
    {
        $user = Auth::user();

        switch ($user->role) {
            case 'admin':
                return $this->getAdminStats();
            case 'project_manager':
                return $this->getManagerStats();
            case 'team_member':
                return $this->getTeamMemberStats();
            case 'client':
                // For future implementation
                return response()->json(['message' => 'Client dashboard not implemented yet']);
            default:
                return response()->json(['error' => 'Unknown role'], 400);
        }
    }
}
