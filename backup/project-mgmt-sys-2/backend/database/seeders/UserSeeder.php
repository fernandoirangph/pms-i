<?php
// Database/seeders/UserSeeder.php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Create admin user
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@klick.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Create project manager
        User::factory()->create([
            'name' => 'Project Manager',
            'email' => 'pm@klick.com',
            'password' => Hash::make('password'),
            'role' => 'project_manager',
        ]);

        // Create regular team members
        User::factory()->count(3)->create([
            'role' => 'team_member',
        ]);

        // Create client users
        User::factory()->count(2)->create([
            'role' => 'client',
        ]);

        // Create additional random users
        User::factory()->count(10)->create();
    }
}
