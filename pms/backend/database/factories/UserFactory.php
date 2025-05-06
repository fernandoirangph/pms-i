<?php
// Database/factories/UserFactory.php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition()
    {
        $lastName = $this->faker->lastName();
        return [
            'first_name' => $this->faker->firstName(),
            'middle_initial' => strtoupper($this->faker->randomLetter()) . ".",
            'last_name' => $lastName,
            'name_suffix' => $this->faker->randomElement(['Jr.', 'Sr.', 'III', null]),
            'email' => strtolower($lastName) . $this->faker->unique()->randomNumber(3) . '@klick.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => $this->faker->randomElement(['project_manager', 'team_member', 'client']),
            'remember_token' => Str::random(10),
        ];
    }

    public function admin()
    {
        return $this->state(function (array $attributes) {
            return [
                'role' => 'admin',
            ];
        });
    }

    public function projectManager()
    {
        return $this->state(function (array $attributes) {
            return [
                'role' => 'project_manager',
            ];
        });
    }

    public function teamMember()
    {
        return $this->state(function (array $attributes) {
            return [
                'role' => 'team_member',
            ];
        });
    }

    public function client()
    {
        return $this->state(function (array $attributes) {
            return [
                'role' => 'client',
            ];
        });
    }
}
