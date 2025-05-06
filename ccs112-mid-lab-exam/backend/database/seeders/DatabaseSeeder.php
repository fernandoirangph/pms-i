<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Product;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Support\Facades\Hash;
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
                'email' => 'admin@example.net',
            ]);

        User::factory()
            ->count(10)
            ->create();

        Product::factory()->count(25)->create();
    }
}
