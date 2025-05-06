<?php
// Database/seeders/ProjectSeeder.php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    public function run()
    {

        // Only create projects for manager_id 1
        $manager = User::where('role', 'project_manager')->where('id', 1)->first();

        Project::factory()->count(5)->create([
            'manager_id' => $manager->id,
        ]);

        $project = Project::find(1);
        $teamMembers = User::where('role', 'team_member')->get();

        if ($project) {
            // Create 5 tasks for project ID 1
            $tasks = Task::factory()->count(10)->create([
                'project_id' => $project->id,
            ]);

            // Assign random team members to each task
            foreach ($tasks as $task) {
                $maxAssignees = min(3, $teamMembers->count()); // Ensure we don't request more than available
                $assignees = $teamMembers->random(rand(1, $maxAssignees))->pluck('id')->toArray();
                $task->update(['team_member_ids' => $assignees]);
            }
        }
    }
}
