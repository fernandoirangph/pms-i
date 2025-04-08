<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Cart;

class OrderController extends Controller
{
    public function history(Request $request)
    {
        $user = Auth::user();

        $orderHistory = Cart::where('user_id', $user->id)
            ->where('is_checkout', true)
            ->with([
                'orders' => function ($orderQuery) {

                    $orderQuery->select('id', 'cart_id', 'product_id', 'quantity', 'price_per_item', 'total_price');
                },
                'orders.product' => function ($productQuery) {
                    $productQuery->select('id', 'name', 'image');
                }
            ])

            ->select('id', 'user_id', 'checkout_timestamp', 'created_at', 'updated_at')
            ->orderBy('checkout_timestamp', 'desc')
            ->paginate(10);

        return response()->json($orderHistory);
    }
}
