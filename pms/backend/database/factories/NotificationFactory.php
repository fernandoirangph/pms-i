<?php
// Database/factories/NotificationFactory.php

namespace Database\Factories;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class NotificationFactory extends Factory
{
    protected $model = Notification::class;

    public function definition()
    {
        return [
            'title' => $this->faker->sentence(),
            'message' => $this->faker->paragraph(),
            'user_id' => User::inRandomOrder()->first()->id ?? User::factory()->create()->id,
            'read' => $this->faker->boolean(30),
            'link' => $this->faker->boolean(70) ? '/projects/' . rand(1, 10) : null,
        ];
    }

    public function unread()
    {
        return $this->state(function (array $attributes) {
            return [
                'read' => false,
            ];
        });
    }
}
