<?php
// Database/factories/TaskFactory.php

namespace Database\Factories;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
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
            'name' => $this->faker->randomElement([
                'Develop a Web Application',
                'Database Design and Implementation',
                'Network Configuration and Setup',
                'Create a Mobile App Prototype',
                'Conduct System Testing',
                'Prepare Technical Documentation',
                'Perform Data Analysis',
                'Develop an API Integration',
                'Set Up Cloud Infrastructure',
                'Implement Cybersecurity Measures'
            ]),
            'description' => $this->faker->randomElement([
                'Design and develop a responsive web application for e-commerce.',
                'Create and optimize a relational database for the project.',
                'Configure and secure a local area network for the office.',
                'Develop a prototype for a mobile application targeting students.',
                'Conduct thorough system testing to ensure software quality.',
                'Prepare detailed technical documentation for the project.',
                'Analyze data trends and provide actionable insights.',
                'Develop and test API integrations for third-party services.',
                'Set up and manage cloud infrastructure for scalability.',
                'Implement advanced cybersecurity measures to protect data.'
            ]),
            'start_date' => $startDate,
            'end_date' => $endDate,
            'status' => $this->faker->randomElement(['not_started', 'in_progress', 'review', 'completed']),
            'priority' => $this->faker->randomElement(['low', 'medium', 'high', 'urgent']),
            'estimated_hours' => $estimatedHours,
            'actual_hours' => $this->faker->randomFloat(2, 0, $estimatedHours * 1.5),
            'project_id' => $project->id,
            'team_member_ids' => User::inRandomOrder()->take($this->faker->numberBetween(1, 5))->pluck('id')->toArray(),
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
