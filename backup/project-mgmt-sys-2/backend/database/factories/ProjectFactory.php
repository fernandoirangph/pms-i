<?php
// Database/factories/ProjectFactory.php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectFactory extends Factory
{
    protected $model = Project::class;

    public function definition()
    {
        $startDate = $this->faker->dateTimeBetween('-6 months', '+1 month');
        $endDate = $this->faker->dateTimeBetween($startDate, '+1 year');

        return [
            'name' => $this->faker->catchPhrase(),
            'description' => $this->faker->paragraph(),
            'start_date' => $startDate,
            'end_date' => $endDate,
            'budget' => $this->faker->randomFloat(2, 5000, 100000),
            'actual_cost' => $this->faker->randomFloat(2, 0, 50000),
            'status' => $this->faker->randomElement(['not_started', 'in_progress', 'on_hold', 'completed', 'cancelled']),
            'manager_id' => User::where('role', 'project_manager')->inRandomOrder()->first() ??
                User::factory()->projectManager()->create(),
        ];
    }

    public function inProgress()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'in_progress',
            ];
        });
    }

    public function completed()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'completed',
            ];
        });
    }
}
