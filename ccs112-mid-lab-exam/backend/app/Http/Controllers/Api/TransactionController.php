<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Cart;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Validator;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'nullable|date_format:Y-m-d',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $query = Cart::where('is_checkout', true)
            ->with([
                'user:id,name,email',
                'orders' => function ($orderQuery) {
                    $orderQuery->select('id', 'cart_id', 'product_id', 'quantity', 'price_per_item', 'total_price');
                },
                'orders.product' => function ($productQuery) {
                    $productQuery->select('id', 'name', 'image');
                }
            ])
            ->select('id', 'user_id', 'checkout_timestamp', 'created_at');

        if ($request->filled('date')) {
            $date = Carbon::parse($request->input('date'))->toDateString();
            $query->whereDate('checkout_timestamp', $date);
        }

        $transactions = $query->orderBy('checkout_timestamp', 'desc')->paginate(20);

        return response()->json($transactions);
    }

    public function show(string $id)
    {
        $transaction = Cart::where('is_checkout', true)
            ->with([
                'user:id,name,email',
                'orders' => function ($orderQuery) {
                    $orderQuery->select('id', 'cart_id', 'product_id', 'quantity', 'price_per_item', 'total_price');
                },
                'orders.product' => function ($productQuery) {
                    $productQuery->select('id', 'name', 'image');
                }
            ])
            ->select('id', 'user_id', 'checkout_timestamp', 'created_at')
            ->find($id);

        if (!$transaction) {
            return response()->json(['message' => 'Transaction not found or not completed.'], 404);
        }

        $totalAmount = $transaction->orders->sum('total_price');
        $transaction->total_transaction_amount = number_format($totalAmount, 2, '.', '');
        return response()->json($transaction);
    }
}
