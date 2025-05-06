<?php
// App/Models/Task.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'start_date',
        'end_date',
        'status',
        'priority',
        'estimated_hours',
        'actual_hours',
        'project_id',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'estimated_hours' => 'decimal:2',
        'actual_hours' => 'decimal:2',
        'team_member_ids' => 'array',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class)->withTimestamps();
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function files()
    {
        return $this->hasMany(File::class);
    }

    public function timeLogs()
    {
        return $this->hasMany(TimeLog::class);
    }
}
