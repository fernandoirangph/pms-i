<?php
// Database/factories/TimeLogFactory.php

namespace Database\Factories;

use App\Models\Task;
use App\Models\TimeLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TimeLogFactory extends Factory
{
    protected $model = TimeLog::class;

    public function definition()
    {
        $task = Task::inRandomOrder()->first() ?? Task::factory()->create();
        $startTime = $this->faker->dateTimeBetween($task->start_date, $task->end_date);
        $endTime = clone $startTime;
        $endTime->modify('+' . rand(1, 8) . ' hours');
        $hours = (strtotime($endTime->format('Y-m-d H:i:s')) - strtotime($startTime->format('Y-m-d H:i:s'))) / 3600;

        return [
            'user_id' => User::inRandomOrder()->first()->id ?? User::factory()->create()->id,
            'task_id' => $task->id,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'description' => $this->faker->sentence(),
            'hours' => round($hours, 2),
        ];
    }
}
