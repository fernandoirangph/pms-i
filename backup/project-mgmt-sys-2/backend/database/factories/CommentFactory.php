<?php
// Database/factories/CommentFactory.php

namespace Database\Factories;

use App\Models\Comment;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CommentFactory extends Factory
{
    protected $model = Comment::class;

    public function definition()
    {
        return [
            'content' => $this->faker->paragraph(),
            'user_id' => User::inRandomOrder()->first()->id ?? User::factory()->create()->id,
            'task_id' => Task::inRandomOrder()->first()->id ?? Task::factory()->create()->id,
        ];
    }
}
