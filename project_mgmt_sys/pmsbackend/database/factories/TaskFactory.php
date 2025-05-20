<?php

namespace Database\Factories;

use App\Models\Task;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Task>
 */
class TaskFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Task::class;

    public function definition(): array
    {
        $bsitTaskTitles = [
            'Design Database Schema',
            'Develop User Authentication',
            'Implement API Endpoints',
            'Integrate QR Code Scanning',
            'Set Up Notification System',
            'Upload Course Materials',
            'Develop Quiz Module',
            'Configure Cloud Deployment',
        ];
        $bsitTaskDescriptions = [
            'Create and optimize the database schema for the project.',
            'Develop secure login and registration for users.',
            'Build RESTful APIs for system modules.',
            'Enable QR code scanning for attendance.',
            'Set up notifications for users and admins.',
            'Add lecture notes and resources for students.',
            'Implement online quizzes and automated grading.',
            'Deploy the application to a cloud platform.',
        ];
        $index = fake()->numberBetween(0, count($bsitTaskTitles) - 1);
        return [
            'title' => $bsitTaskTitles[$index],
            'description' => $bsitTaskDescriptions[$index],
            'status' => fake()->randomElement(['pending', 'in progress', 'completed']),
            'priority' => fake()->randomElement(['low', 'medium', 'high']),
        ];
    }
}
