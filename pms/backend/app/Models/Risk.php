<?php
// App/Models/Risk.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Risk extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'impact',
        'probability',
        'mitigation_strategy',
        'status',
        'project_id',
        'reported_by',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reported_by');
    }
}
