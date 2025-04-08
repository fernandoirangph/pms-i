<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;  
use App\Http\Controllers\Api\TransactionController;  
use App\Http\Controllers\Api\CartController;
 
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
 
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::apiResource('products', ProductController::class);
     
    Route::middleware('IsAdmin')->prefix('admin')->group(function () {  
        Route::get('/transactions', [TransactionController::class, 'index']);  
        Route::get('/transactions/{id}', [TransactionController::class, 'show']);  
    });
     
    Route::middleware('IsCustomer')->group(function () {
        Route::get('/orders/history', [OrderController::class, 'history']);  
         
        Route::post('/cart/add', [CartController::class, 'addToCart']);
        Route::put('/cart/update/{order_id}', [CartController::class, 'updateCartItem']);
        Route::delete('/cart/remove/{order_id}', [CartController::class, 'removeCartItem']);
        Route::post('/cart/checkout', [CartController::class, 'checkout']);
        Route::get('/cart', [CartController::class, 'viewCart']);  
    });
}); 