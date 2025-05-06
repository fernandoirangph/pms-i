<?php
// App/Http/Controllers/RiskController.php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Risk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RiskController extends Controller
{
    public function index(Request $request)
    {
        $projectId = $request->query('project_id');

        if (!$projectId) {
            return response()->json(['error' => 'Project ID is required'], 400);
        }

        $risks = Risk::where('project_id', $projectId)
            ->with('reporter')
            ->get();

        return response()->json($risks);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'impact' => 'required|in:low,medium,high,critical',
            'probability' => 'required|in:low,medium,high,certain',
            'mitigation_strategy' => 'nullable|string',
            'status' => 'required|in:identified,mitigated,occurred,closed',
            'project_id' => 'required|exists:projects,id',
        ]);

        $risk = Risk::create([
            'title' => $request->title,
            'description' => $request->description,
            'impact' => $request->impact,
            'probability' => $request->probability,
            'mitigation_strategy' => $request->mitigation_strategy,
            'status' => $request->status,
            'project_id' => $request->project_id,
            'reported_by' => Auth::id(),
        ]);

        // Notify project manager about the risk
        $project = $risk->project;
        $currentUser = Auth::user();

        if ($project->manager_id !== $currentUser->id) {
            Notification::create([
                'title' => 'New Risk Reported',
                'message' => "{$currentUser->name} reported a new risk for project: {$project->name}",
                'user_id' => $project->manager_id,
                'link' => "/projects/{$project->id}/risks",
            ]);
        }

        return response()->json($risk->load('reporter'), 201);
    }

    public function show(Risk $risk)
    {
        return response()->json($risk->load('reporter'));
    }

    public function update(Request $request, Risk $risk)
    {
        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'impact' => 'sometimes|required|in:low,medium,high,critical',
            'probability' => 'sometimes|required|in:low,medium,high,certain',
            'mitigation_strategy' => 'nullable|string',
            'status' => 'sometimes|required|in:identified,mitigated,occurred,closed',
        ]);

        $oldStatus = $risk->status;
        $risk->update($request->all());

        // If risk status changed to 'occurred' or 'critical', notify project manager
        if (($oldStatus !== 'occurred' && $risk->status === 'occurred') ||
            ($request->has('impact') && $request->impact === 'critical')
        ) {
            $project = $risk->project;
            $currentUser = Auth::user();

            if ($project->manager_id !== $currentUser->id) {
                Notification::create([
                    'title' => 'Risk Status Update',
                    'message' => "Risk '{$risk->title}' has been updated to {$risk->status}",
                    'user_id' => $project->manager_id,
                    'link' => "/projects/{$project->id}/risks",
                ]);
            }
        }

        return response()->json($risk->load('reporter'));
    }

    public function destroy(Risk $risk)
    {
        $user = Auth::user();

        // Check if user is admin, project manager, or risk reporter
        if (
            $user->role !== 'admin' &&
            $risk->project->manager_id !== $user->id &&
            $risk->reported_by !== $user->id
        ) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $risk->delete();
        return response()->json(null, 204);
    }
}
