<?php
// Database/seeders/DatabaseSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $this->call([
            UserSeeder::class,
            ProjectSeeder::class,
            TaskSeeder::class,
            CommentSeeder::class,
            TimeLogSeeder::class,
            NotificationSeeder::class,
            RiskSeeder::class,
        ]);
    }
}
