<?php
// Database/seeders/CommentSeeder.php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class CommentSeeder extends Seeder
{
    public function run()
    {
        $tasks = Task::all();
        $users = User::all();

        foreach ($tasks as $task) {
            // Add 0-5 comments to each task
            $commentCount = rand(0, 5);

            for ($i = 0; $i < $commentCount; $i++) {
                Comment::factory()->create([
                    'task_id' => $task->id,
                    'user_id' => $users->random()->id,
                ]);
            }
        }
    }
}
