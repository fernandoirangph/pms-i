<?php
// Database/seeders/ProjectSeeder.php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    public function run()
    {
        // Only create projects for manager_id 1
        $manager = User::where('role', 'project_manager')->where('id', 1)->first();

        if ($manager) {
            Project::factory()->count(rand(1, 3))->create([
                'manager_id' => $manager->id,
            ]);
        }

        // Create a few more random projects
        Project::factory()->count(10)->create();
    }
}
