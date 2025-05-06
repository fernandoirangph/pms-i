<?php
// App/Models/User.php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'first_name',
        'middle_initial',
        'last_name',
        'name_suffix',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function managedProjects()
    {
        return $this->hasMany(Project::class, 'manager_id');
    }

    public function tasks()
    {
        return $this->belongsToMany(Task::class)->withTimestamps();
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function timeLogs()
    {
        return $this->hasMany(TimeLog::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function files()
    {
        return $this->hasMany(File::class);
    }

    public function reportedRisks()
    {
        return $this->hasMany(Risk::class, 'reported_by');
    }
}
