<?php
// App/Http/Controllers/CommentController.php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Notification;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    public function index(Request $request)
    {
        $taskId = $request->query('task_id');

        if (!$taskId) {
            return response()->json(['error' => 'Task ID is required'], 400);
        }

        $comments = Comment::where('task_id', $taskId)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($comments);
    }

    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|string',
            'task_id' => 'required|exists:tasks,id',
        ]);

        $comment = Comment::create([
            'content' => $request->content,
            'task_id' => $request->task_id,
            'user_id' => Auth::id(),
        ]);

        // Notify other users assigned to the task
        $task = Task::find($request->task_id);
        $currentUser = Auth::user();

        foreach ($task->users as $user) {
            if ($user->id !== $currentUser->id) {
                Notification::create([
                    'title' => 'New Comment',
                    'message' => "{$currentUser->name} commented on task: {$task->name}",
                    'user_id' => $user->id,
                    'link' => "/tasks/{$task->id}",
                ]);
            }
        }

        return response()->json($comment->load('user'), 201);
    }

    public function update(Request $request, Comment $comment)
    {
        $this->authorize('update', $comment);

        $request->validate([
            'content' => 'required|string',
        ]);

        $comment->update([
            'content' => $request->content,
        ]);

        return response()->json($comment->load('user'));
    }

    public function destroy(Comment $comment)
    {
        $this->authorize('delete', $comment);

        $comment->delete();
        return response()->json(null, 204);
    }
}
