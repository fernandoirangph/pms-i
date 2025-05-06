<?php
// App/Models/Project.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'start_date',
        'end_date',
        'budget',
        'actual_cost',
        'status',
        'manager_id',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'budget' => 'decimal:2',
        'actual_cost' => 'decimal:2',
    ];

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function files()
    {
        return $this->hasMany(File::class);
    }

    public function risks()
    {
        return $this->hasMany(Risk::class);
    }

    public function getProgressAttribute()
    {
        if ($this->tasks->count() === 0) {
            return 0;
        }

        $completedTasks = $this->tasks->where('status', 'completed')->count();
        return ($completedTasks / $this->tasks->count()) * 100;
    }
}
