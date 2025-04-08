<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use App\Models\User; 

class AuthController extends Controller
{

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);


        $user = User::where('email', $request->email)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['Email not found.'],
            ]);
        }

        if (!Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                 'password' => ['Wrong password.'],
            ]);
        }

        $token = $user->createToken('auth_token' . $user->id)->plainTextToken; 

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => [ 
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role, 
            ]
        ], 200); 
    }

    public function register(Request $request)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users', 
            'password' => ['required', 'confirmed',  Rules\Password::defaults()],
        ];

        $messages = [
            'name.required' => 'Please enter your name.',
            'email.required' => 'Please enter your email address.',
            'email.email' => 'Please enter a valid email address.',
            'email.unique' => 'This email address is already registered. Please try logging in or use a different email.',
            'password.required' => 'Please enter a password.',
            'password.confirmed' => 'The password confirmation does not match. Please re-enter your password.',
        ];

        try {
            $validatedData = $request->validate($rules, $messages);
        } catch (ValidationException $e) {
            throw $e;
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password), 
            'role' => $request->input('role', 'customer'),
        ]);

        $token = $user->createToken('api-token-' . $user->id)->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'token' => $token,
            'user' => [ 
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ], 201); 
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        $user->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Successfully logged out'
        ], 200); 
    }
}