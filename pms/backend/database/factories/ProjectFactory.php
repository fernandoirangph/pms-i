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
            'name' => $this->faker->randomElement([
                'IT Capstone Project',
                'Web Development for E-Learning',
                'Mobile App for Campus Navigation',
                'Library Management System',
                'Online Enrollment System'
            ]),
            'description' => $this->faker->randomElement([
                'A project focused on developing a comprehensive IT solution for academic purposes.',
                'An e-learning platform designed to enhance online education.',
                'A mobile application to assist students in navigating the campus.',
                'A system to manage library resources efficiently.',
                'An online system to streamline the enrollment process.'
            ]),
            'start_date' => $startDate,
            'end_date' => $endDate,
            'budget' => $this->faker->randomFloat(2, 10000, 50000),
            'actual_cost' => $this->faker->randomFloat(2, 0, 40000),
            'status' => $this->faker->randomElement(['not_started', 'in_progress', 'completed']),
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
