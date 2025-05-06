<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [LoginController::class, 'register']);
    Route::post('/login', [LoginController::class, 'login']);
});

// Protected routes (requires authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [LoginController::class, 'user']);
    Route::post('/logout', [LoginController::class, 'logout']);

    Route::get('/projects', [ProjectController::class, 'index']);
    Route::get('/projects/{id}', [ProjectController::class, 'show']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::put('/projects/{project}', [ProjectController::class, 'update']);
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);

    Route::get('/tasks', [TaskController::class, 'index']);
    Route::get('/tasks/{id}', [TaskController::class, 'show']);
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::put('/tasks/{id}', [TaskController::class, 'update']);
    Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);
});
