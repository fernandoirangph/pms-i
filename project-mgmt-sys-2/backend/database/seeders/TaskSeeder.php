<?php
// Database/seeders/TaskSeeder.php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    public function run()
    {
        // Get the project with ID 1
        $project = Project::find(1);
        $teamMembers = User::where('role', 'team_member')->get();

        if ($teamMembers->isEmpty()) {
            $teamMembers = User::factory()->count(5)->teamMember()->create();
        }

        if ($project) {
            // Create 5-15 tasks for project ID 1
            $tasks = Task::factory()->count(rand(5, 15))->create([
                'project_id' => $project->id,
            ]);

            // Assign random team members to each task
            foreach ($tasks as $task) {
                $assignees = $teamMembers->random(rand(1, 3));
                $task->users()->attach($assignees);
            }
        }
    }
}
