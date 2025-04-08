<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Product;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()
        ->admin()
        ->create([
            'name' => 'Admin User',
            'email' => 'admin@email.com',
        ]);

        User::factory()
            ->count(10) 
            ->create();

        Product::factory()->count(25)->create();
    }
}
