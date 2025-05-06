<?php
// Database/factories/TaskFactory.php

namespace Database\Factories;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskFactory extends Factory
{
    protected $model = Task::class;

    public function definition()
    {
        $project = Project::inRandomOrder()->first() ?? Project::factory()->create();
        $startDate = $this->faker->dateTimeBetween($project->start_date, $project->end_date);
        $endDate = $this->faker->dateTimeBetween($startDate, $project->end_date);
        $estimatedHours = $this->faker->randomFloat(2, 1, 40);

        return [
            'name' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'start_date' => $startDate,
            'end_date' => $endDate,
            'status' => $this->faker->randomElement(['not_started', 'in_progress', 'review', 'completed']),
            'priority' => $this->faker->randomElement(['low', 'medium', 'high', 'urgent']),
            'estimated_hours' => $estimatedHours,
            'actual_hours' => $this->faker->randomFloat(2, 0, $estimatedHours * 1.5),
            'project_id' => $project->id,
        ];
    }

    public function completed()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'completed',
            ];
        });
    }

    public function inProgress()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'in_progress',
            ];
        });
    }

    public function highPriority()
    {
        return $this->state(function (array $attributes) {
            return [
                'priority' => 'high',
            ];
        });
    }
}
