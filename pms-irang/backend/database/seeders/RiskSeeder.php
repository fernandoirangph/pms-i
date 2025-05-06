<?php
// Database/seeders/RiskSeeder.php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Risk;
use App\Models\User;
use Illuminate\Database\Seeder;

class RiskSeeder extends Seeder
{
    public function run()
    {
        $projects = Project::all();
        $users = User::all();

        foreach ($projects as $project) {
            // Create 1-5 risks per project
            $riskCount = rand(1, 5);

            for ($i = 0; $i < $riskCount; $i++) {
                Risk::factory()->create([
                    'project_id' => $project->id,
                    'reported_by' => $users->random()->id,
                ]);
            }

            // Add one high impact risk per project
            Risk::factory()->create([
                'project_id' => $project->id,
                'reported_by' => $users->random()->id,
                'impact' => 'high',
                'probability' => 'medium',
                'status' => 'identified',
            ]);
        }
    }
}
