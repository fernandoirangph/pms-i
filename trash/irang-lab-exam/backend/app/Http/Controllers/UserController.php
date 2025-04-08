<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;


class UserController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email|',
            'password' => 'required|string|max:12|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors(), 422]);
        }
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json(
            [
                'message' => 'User registered',
                'user' => $user,
                'token' => $token
            ],
            201
        );
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|max:12|min:8',
        ]);
        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(
                ['error' => 'Invalid email',],
                401
            );
        } else if (!Hash::check($request->password, $user->password)) {
            return response()->json(
                ['error' => 'Invalid password',],
                401
            );
        }

        $token = JWTAuth::fromUser($user);

        return response()->json(
            [
                'message' => 'Login succesfully',
                'user' => $user->makeHidden(['password']),
                'token' => $token
            ],
            201
        );
    }

    public function dashboard(Request $request)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
        } catch (\Tymon\JWTAuth\Exceptions\TokenInvalidException $e) {
            return response()->json(
                ['error' => 'Invalid token',],
                401
            );
        } catch (\Tymon\JWTAuth\Exceptions\TokenExpiredException $e) {
            return response()->json(
                ['error' => 'Expired token',],
                401
            );
        }
        return response()->json(
            [
                'message' => 'Login succesfully',
                'user' => $user,
                'message' => 'Welcome to your dashboard'
            ]
        );
    }
    public function logout(Request $request)
    {
        try {
            $token = JWTAuth::getToken();
            if (!$token) {
                return response()->json(
                    ['error' => 'Token is not provided.',],
                    401
                );
            }
            JWTAuth::invalidate($token);
            return response()->json(
                ['message' => 'Log out successfully',],
                401
            );
        } catch (\Tymon\JWTAuth\Exceptions\JWTException $e) {
            return response()->json(
                ['error' => 'Failed to logout',],
                401
            );
        }
    }
}
