<?php
// Database/factories/RiskFactory.php

namespace Database\Factories;

use App\Models\Project;
use App\Models\Risk;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class RiskFactory extends Factory
{
    protected $model = Risk::class;

    public function definition()
    {
        return [
            'title' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'impact' => $this->faker->randomElement(['low', 'medium', 'high', 'critical']),
            'probability' => $this->faker->randomElement(['low', 'medium', 'high', 'certain']),
            'mitigation_strategy' => $this->faker->paragraph(),
            'status' => $this->faker->randomElement(['identified', 'mitigated', 'occurred', 'closed']),
            'project_id' => Project::inRandomOrder()->first()->id ?? Project::factory()->create()->id,
            'reported_by' => User::inRandomOrder()->first()->id ?? User::factory()->create()->id,
        ];
    }
}
