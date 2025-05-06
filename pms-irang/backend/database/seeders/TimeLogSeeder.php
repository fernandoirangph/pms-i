<?php
// Database/seeders/TimeLogSeeder.php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\TimeLog;
use Illuminate\Database\Seeder;

class TimeLogSeeder extends Seeder
{
    public function run()
    {
        $tasks = Task::with('users')->get();

        foreach ($tasks as $task) {
            if ($task->users->isEmpty()) {
                continue;
            }

            // Add 1-3 time logs per user assigned to the task
            foreach ($task->users as $user) {
                $logCount = rand(1, 3);

                for ($i = 0; $i < $logCount; $i++) {
                    TimeLog::factory()->create([
                        'task_id' => $task->id,
                        'user_id' => $user->id,
                    ]);
                }
            }
        }
    }
}
