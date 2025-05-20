<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Task;
use App\Models\TimeLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $testUser = User::factory()->create([
            'name' => 'Juan dela Cruz',
            'email' => 'account@klick.com',
            'password' => Hash::make('password'),
        ]);

        $otherUsers = User::factory(5)->create();
        $allUsers = $otherUsers->push($testUser);

        // --- Create BSIT-aligned projects for test user ---
        $bsitProjects = [
            [
                'name' => 'BSIT Capstone Management System',
                'description' => 'A platform for managing and tracking BSIT capstone projects, including submissions, reviews, and grading.',
            ],
            [
                'name' => 'BSIT Attendance Tracker',
                'description' => 'A web application to monitor and record student attendance in BSIT classes in real-time.',
            ],
            [
                'name' => 'BSIT E-Learning Portal',
                'description' => 'An e-learning portal providing resources, quizzes, and forums for BSIT students and faculty.',
            ],
        ];
        $testUserProjects = collect();
        foreach ($bsitProjects as $proj) {
            $testUserProjects->push(Project::factory()->for($testUser, 'owner')->create($proj));
        }

        // --- Create BSIT-aligned projects for other users ---
        $otherProjects = collect();
        $otherUsers->each(function ($user) use (&$otherProjects) {
            $bsitOtherProjects = [
                [
                    'name' => 'BSIT Internship Portal',
                    'description' => 'A portal for managing BSIT student internships and company partnerships.',
                ],
                [
                    'name' => 'BSIT Research Repository',
                    'description' => 'A repository for storing and sharing BSIT research outputs.',
                ],
            ];
            foreach ($bsitOtherProjects as $proj) {
                $otherProjects->push(Project::factory()->for($user, 'owner')->create($proj));
            }
        });

        $allProjects = $testUserProjects->concat($otherProjects);

        // --- Create BSIT-aligned tasks for each project ---
        $bsitTasks = [
            'BSIT Capstone Management System' => [
                ['title' => 'Design Database Schema', 'description' => 'Create and optimize the database schema for capstone projects.'],
                ['title' => 'Implement Submission Module', 'description' => 'Develop the module for students to submit their capstone projects.'],
                ['title' => 'Set Up Review Workflow', 'description' => 'Configure the workflow for faculty to review and grade submissions.'],
            ],
            'BSIT Attendance Tracker' => [
                ['title' => 'Integrate QR Code Scanning', 'description' => 'Enable QR code scanning for attendance logging.'],
                ['title' => 'Develop Attendance Analytics', 'description' => 'Create dashboards to visualize attendance trends.'],
                ['title' => 'Implement Notification System', 'description' => 'Set up notifications for absentees and latecomers.'],
            ],
            'BSIT E-Learning Portal' => [
                ['title' => 'Upload Course Materials', 'description' => 'Add lecture notes and resources for BSIT courses.'],
                ['title' => 'Develop Quiz Module', 'description' => 'Implement a module for online quizzes and grading.'],
                ['title' => 'Set Up Discussion Forums', 'description' => 'Create forums for students and faculty discussions.'],
            ],
            'BSIT Internship Portal' => [
                ['title' => 'Company Registration', 'description' => 'Develop module for companies to register and post internships.'],
                ['title' => 'Student Application System', 'description' => 'Allow students to apply for internships online.'],
                ['title' => 'Internship Progress Tracking', 'description' => 'Track student progress during internships.'],
            ],
            'BSIT Research Repository' => [
                ['title' => 'Upload Research Papers', 'description' => 'Allow students and faculty to upload research outputs.'],
                ['title' => 'Implement Search Functionality', 'description' => 'Enable searching and filtering of research papers.'],
                ['title' => 'Set Up Peer Review', 'description' => 'Create a peer review system for submitted research.'],
            ],
        ];

        foreach ($allProjects as $project) {
            $tasksForProject = $bsitTasks[$project->name] ?? [];
            foreach ($tasksForProject as $taskData) {
                Task::factory()->create([
                    'project_id' => $project->id,
                    'created_by' => $project->created_by,
                    'assigned_user_id' => fake()->optional(0.8)->randomElement($allUsers->pluck('id')->toArray()),
                    'title' => $taskData['title'],
                    'description' => $taskData['description'],
                ]);
            }
        }

        foreach ($allProjects as $project) {
            // For each project, create a random number of tasks
            $tasks = Task::factory(rand(5, 15))->create([
                'project_id' => $project->id,
                'created_by' => $project->created_by, // Assign project owner as task creator
                // Randomly assign tasks to users (with 80% probability of assignment)
                'assigned_user_id' => fake()->optional(0.8)->randomElement($allUsers->pluck('id')->toArray()),
            ]);

            // --- Create Time Logs for Tasks ---
            foreach ($tasks as $task) {
                // Determine if task has an assigned user
                $userId = $task->assigned_user_id;

                // If task is assigned, create time logs (not all tasks will have time logs)
                if ($userId && fake()->boolean(70)) { // 70% of assigned tasks have time logs
                    // Create between 1-5 time log entries for this task
                    $numLogs = rand(1, 5);

                    for ($i = 0; $i < $numLogs; $i++) {
                        // Create realistic time log entries within the last month
                        $startDate = Carbon::now()->subDays(rand(0, 30))->setTime(rand(8, 17), rand(0, 59));

                        // Log between 15 minutes to 4 hours of work
                        $duration = rand(15, 240); // minutes
                        $endDate = (clone $startDate)->addMinutes($duration);

                        TimeLog::create([
                            'user_id' => $userId,
                            'task_id' => $task->id,
                            'start_time' => $startDate,
                            'end_time' => $endDate,
                            'description' => fake()->optional(0.7)->sentence(), // 70% chance to have a description
                        ]);
                    }
                }
            }
        }

        // Ensure test user has some active time logs for testing ongoing work
        $testUserTasks = Task::where('assigned_user_id', $testUser->id)->take(3)->get();

        foreach ($testUserTasks as $task) {
            // Create an active time log (with no end time) for test user
            if (fake()->boolean(30)) { // Only 30% chance to have active logs
                TimeLog::create([
                    'user_id' => $testUser->id,
                    'task_id' => $task->id,
                    'start_time' => Carbon::now()->subHours(rand(1, 4))->subMinutes(rand(1, 59)),
                    'end_time' => null, // Represents currently active work
                    'description' => 'Currently working on ' . fake()->sentence(3),
                ]);
            }
        }

        // --- Create additional time logs with various patterns for better testing ---
        // 1. Create some logs spanning multiple days for long-term tasks
        $longTermTasks = Task::inRandomOrder()->take(5)->get();
        foreach ($longTermTasks as $task) {
            if ($task->assigned_user_id) {
                // Create logs spanning over multiple days for reporting testing
                for ($day = 1; $day <= rand(3, 7); $day++) {
                    $logDate = Carbon::now()->subDays($day);

                    TimeLog::create([
                        'user_id' => $task->assigned_user_id,
                        'task_id' => $task->id,
                        'start_time' => $logDate->copy()->setTime(9, 0),
                        'end_time' => $logDate->copy()->setTime(rand(10, 17), rand(0, 59)),
                        'description' => "Day $day of development: " . fake()->sentence(),
                    ]);
                }
            }
        }

        // 2. Create overlapping logs for testing time reporting accuracy
        if ($testUserTasks->count() >= 2) {
            $task1 = $testUserTasks[0];
            $task2 = $testUserTasks[1];

            // Create slightly overlapping time logs for the test user
            $yesterday = Carbon::yesterday();

            TimeLog::create([
                'user_id' => $testUser->id,
                'task_id' => $task1->id,
                'start_time' => $yesterday->copy()->setTime(10, 0),
                'end_time' => $yesterday->copy()->setTime(12, 30),
                'description' => 'Morning work session',
            ]);

            TimeLog::create([
                'user_id' => $testUser->id,
                'task_id' => $task2->id,
                'start_time' => $yesterday->copy()->setTime(12, 0), // Note the 30min overlap
                'end_time' => $yesterday->copy()->setTime(14, 30),
                'description' => 'Afternoon work session with some overlap',
            ]);
        }
    }
}
