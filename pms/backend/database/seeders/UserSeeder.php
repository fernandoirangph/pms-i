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
        // User::factory()->create([
        //     'name' => 'Admin User',
        //     'email' => 'admin@klick.com',
        //     'password' => Hash::make('password'),
        //     'role' => 'admin',
        // ]);

        // Create project manager
        User::factory()->create([
            'first_name' => 'Fernando',
            'middle_initial' => 'I.',
            'last_name' => 'Irang',
            'name_suffix' => 'Jr.',
            'email' => 'irang@klick.com',
            'password' => Hash::make('password'),
            'role' => 'project_manager',
        ]);

        User::factory()->create([
            'first_name' => 'Marlon',
            'middle_initial' => 'C.',
            'last_name' => 'Inocencio',
            'name_suffix' => null,
            'email' => 'inocencio@klick.com',
            'password' => Hash::make('password'),
            'role' => 'team_member',
        ]);

        User::factory()->create([
            'first_name' => 'John Shielwyn',
            'middle_initial' => 'V.',
            'last_name' => 'Kipte',
            'name_suffix' => null,
            'email' => 'kipte@klick.com',
            'password' => Hash::make('password'),
            'role' => 'team_member',
        ]);

        User::factory()->create([
            'first_name' => 'Vin Cendrick',
            'middle_initial' => 'A.',
            'last_name' => 'Lamis',
            'name_suffix' => null,
            'email' => 'lamis@klick.com',
            'password' => Hash::make('password'),
            'role' => 'team_member',
        ]);

        User::factory()->create([
            'first_name' => 'John Elwin',
            'middle_initial' => null,
            'last_name' => 'Madraga',
            'name_suffix' => null,
            'email' => 'madraga@klick.com',
            'password' => Hash::make('password'),
            'role' => 'team_member',
        ]);

        // Create client users
        User::factory()->count(2)->create([
            'role' => 'client',
        ]);
    }
}
