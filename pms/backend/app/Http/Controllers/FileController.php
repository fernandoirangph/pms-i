<?php
// App/Http/Controllers/FileController.php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class FileController extends Controller
{
    public function index(Request $request)
    {
        $projectId = $request->query('project_id');
        $taskId = $request->query('task_id');

        $query = File::query();

        if ($projectId) {
            $query->where('project_id', $projectId);
        }

        if ($taskId) {
            $query->where('task_id', $taskId);
        }

        $files = $query->with('user')->get();

        return response()->json($files);
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'project_id' => 'nullable|exists:projects,id',
            'task_id' => 'nullable|exists:tasks,id',
        ]);

        if (!$request->project_id && !$request->task_id) {
            return response()->json(['error' => 'Either project_id or task_id must be provided'], 400);
        }

        $uploadedFile = $request->file('file');
        $path = $uploadedFile->store('files', 'public');

        $file = File::create([
            'name' => $uploadedFile->getClientOriginalName(),
            'path' => $path,
            'mime_type' => $uploadedFile->getMimeType(),
            'size' => $uploadedFile->getSize(),
            'project_id' => $request->project_id,
            'task_id' => $request->task_id,
            'user_id' => Auth::id(),
        ]);

        // Create notifications based on context
        $currentUser = Auth::user();

        if ($request->task_id) {
            $task = $file->task;

            foreach ($task->users as $user) {
                if ($user->id !== $currentUser->id) {
                    Notification::create([
                        'title' => 'New File Uploaded',
                        'message' => "{$currentUser->name} uploaded a file to task: {$task->name}",
                        'user_id' => $user->id,
                        'link' => "/tasks/{$task->id}",
                    ]);
                }
            }
        } elseif ($request->project_id) {
            $project = $file->project;

            Notification::create([
                'title' => 'New Project File',
                'message' => "{$currentUser->name} uploaded a file to project: {$project->name}",
                'user_id' => $project->manager_id,
                'link' => "/projects/{$project->id}/files",
            ]);
        }

        return response()->json($file->load('user'), 201);
    }

    public function show(File $file)
    {
        return response()->json($file->load('user'));
    }

    public function destroy(File $file)
    {
        // Check authorization
        $user = Auth::user();
        if ($user->id !== $file->user_id && $user->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Delete the actual file
        Storage::disk('public')->delete($file->path);

        // Delete the database record
        $file->delete();

        return response()->json(null, 204);
    }

    public function download(File $file)
    {
        return Storage::disk('public')->download($file->path, $file->name);
    }
}
