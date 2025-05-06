<?php
// App/Models/TimeLog.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TimeLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'task_id',
        'start_time',
        'end_time',
        'description',
        'hours',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'hours' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function task()
    {
        return $this->belongsTo(Task::class);
    }
}
