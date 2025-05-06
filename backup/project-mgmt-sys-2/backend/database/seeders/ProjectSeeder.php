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
        // Get project managers
        $projectManagers = User::where('role', 'project_manager')->get();

        if ($projectManagers->isEmpty()) {
            $projectManagers = User::factory()->count(2)->projectManager()->create();
        }

        // Create some projects for each manager
        foreach ($projectManagers as $manager) {
            Project::factory()->count(rand(1, 3))->create([
                'manager_id' => $manager->id,
            ]);
        }

        // Create a few more random projects
        Project::factory()->count(5)->create();
    }
}
