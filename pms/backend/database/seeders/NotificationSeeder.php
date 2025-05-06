<?php
// Database/seeders/NotificationSeeder.php

namespace Database\Seeders;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    public function run()
    {
        $users = User::all();

        foreach ($users as $user) {
            // Create 2-8 notifications per user
            $notificationCount = rand(2, 8);

            Notification::factory()->count($notificationCount)->create([
                'user_id' => $user->id,
            ]);

            // Ensure at least one unread notification
            Notification::factory()->unread()->create([
                'user_id' => $user->id,
                'title' => 'New Task Assigned',
                'message' => 'You have been assigned to a new task. Please check your dashboard.',
            ]);
        }
    }
}
