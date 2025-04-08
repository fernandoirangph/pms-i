<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Models\Cart;
use App\Models\Order;
use App\Models\Product;
use Carbon\Carbon;

class CartController extends Controller
{
    public function addToCart(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|integer|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $user = Auth::user();
            $productId = $request->input('product_id');
            $quantity = $request->input('quantity');

            $product = Product::findOrFail($productId);


            if ($product->stock <= 0) {
                return response()->json([
                    'message' => 'Product is out of stock.',
                    'available_stock' => 0,
                    'requested_quantity' => $quantity
                ], 400);
            }

            if ($product->stock < $quantity) {
                return response()->json([
                    'message' => 'Insufficient stock.',
                    'available_stock' => $product->stock,
                    'requested_quantity' => $quantity
                ], 400);
            }

            $cart = Cart::firstOrCreate(
                ['user_id' => $user->id, 'is_checkout' => false],
                ['created_at' => now(), 'updated_at' => now()]
            );

            $existingItem = $cart->orders()->where('product_id', $productId)->first();
            $newQuantity = ($existingItem ? $existingItem->quantity : 0) + $quantity;

            if ($product->stock < $newQuantity) {
                $availableToAdd = $product->stock - ($existingItem ? $existingItem->quantity : 0);
                return response()->json([
                    'message' => 'Adding this quantity would exceed available stock.',
                    'available_stock' => $product->stock,
                    'current_cart_quantity' => $existingItem ? $existingItem->quantity : 0,
                    'available_to_add' => max(0, $availableToAdd),
                    'requested_quantity' => $quantity
                ], 400);
            }

            $totalPrice = $product->price * $newQuantity;

            $orderItem = Order::updateOrCreate(
                [
                    'cart_id' => $cart->id,
                    'product_id' => $productId,
                ],
                [
                    'quantity' => $newQuantity,
                    'price_per_item' => $product->price,
                    'total_price' => $totalPrice,
                    'updated_at' => now(),
                ]
            );

            DB::commit();

            return response()->json([
                'message' => 'Product added to cart successfully.',
                'cart_item' => $orderItem,
                'cart_total' => $cart->orders()->sum('total_price')
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to add product to cart.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function checkout(Request $request)
    {
        $user = Auth::user();

        $cart = Cart::where('user_id', $user->id)
            ->where('is_checkout', false)
            ->with('orders.product')
            ->first();

        if (!$cart || $cart->orders->isEmpty()) {
            return response()->json(['message' => 'Your cart is empty or not found.'], 404);
        }

        try {
            DB::beginTransaction();

            foreach ($cart->orders as $orderItem) {

                $product = Product::where('id', $orderItem->product_id)->lockForUpdate()->first();

                if (!$product || $product->stock <= 0) {
                    DB::rollBack();
                    return response()->json([
                        'message' => 'Checkout failed: Product "' . ($product->name ?? 'ID:' . $orderItem->product_id) . '" is out of stock.',
                        'product_id' => $orderItem->product_id,
                        'available_stock' => $product->stock ?? 0,
                        'requested_quantity' => $orderItem->quantity,
                    ], 400);
                }

                if ($product->stock < $orderItem->quantity) {

                    DB::rollBack();
                    return response()->json([
                        'message' => 'Checkout failed: Insufficient stock for product "' . ($product->name ?? 'ID:' . $orderItem->product_id) . '".',
                        'product_id' => $orderItem->product_id,
                        'available_stock' => $product->stock ?? 0,
                        'requested_quantity' => $orderItem->quantity,
                    ], 400);
                }

                $product->decrement('stock', $orderItem->quantity);

                $orderItem->total_price = $orderItem->price_per_item * $orderItem->quantity;
                $orderItem->save();
            }

            $cart->is_checkout = true;
            $cart->checkout_timestamp = Carbon::now();
            $cart->save();

            DB::commit();

            return response()->json([
                'message' => 'Checkout successful!',
                'transaction_id' => $cart->id,
                'completed_cart' => $cart->load('orders.product:id,name,image')
            ], 200);
        } catch (\Exception $e) {

            DB::rollBack();

            return response()->json([
                'message' => 'Checkout failed',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal error'
            ], 500);
        }
    }

    public function viewCart(Request $request)
    {
        $user = Auth::user();

        $cart = Cart::where('user_id', $user->id)
            ->where('is_checkout', false)
            ->with(['orders.product:id,name,description,price,image,stock'])
            ->first();

        if (!$cart) {
            return response()->json(['message' => 'No active cart found.', 'cart' => null], 200);
        }

        $cartTotal = $cart->orders->sum('total_price');
        $cart->total_amount = number_format($cartTotal, 2, '.', '');

        return response()->json(['cart' => $cart]);
    }

    public function updateCartItem(Request $request, $order_id)
    {
        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = Auth::user();
        $newQuantity = $request->input('quantity');


        $orderItem = Order::where('id', $order_id)
            ->whereHas('cart', function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('is_checkout', false);
            })
            ->first();

        if (!$orderItem) {
            return response()->json(['message' => 'Cart item not found in active cart.'], 404);
        }

        $product = Product::find($orderItem->product_id);
        if (!$product) {
            return response()->json(['message' => 'Associated product not found.'], 404);
        }


        if ($product->stock <= 0) {
            return response()->json([
                'message' => 'Product is out of stock.',
                'available_stock' => 0,
                'requested_quantity' => $newQuantity
            ], 400);
        }

        if ($product->stock < $newQuantity) {
            return response()->json([
                'message' => 'Insufficient stock for the updated quantity.',
                'available_stock' => $product->stock,
                'requested_quantity' => $newQuantity
            ], 400);
        }

        $orderItem->quantity = $newQuantity;
        $orderItem->total_price = $orderItem->price_per_item * $newQuantity;
        $orderItem->save();

        $updatedCart = $orderItem->cart->load(['orders.product:id,name,price,image,stock']);
        return response()->json([
            'message' => 'Cart item updated.',
            'cart' => $updatedCart
        ]);
    }

    public function removeCartItem(Request $request, $order_id)
    {
        $user = Auth::user();

        $orderItem = Order::where('id', $order_id)
            ->whereHas('cart', function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('is_checkout', false);
            })
            ->first();

        if (!$orderItem) {
            return response()->json(['message' => 'Cart item not found in active cart.'], 404);
        }

        $cart = $orderItem->cart;
        $orderItem->delete();

        $updatedCart = $cart->load(['orders.product:id,name,price,image,stock']);

        return response()->json([
            'message' => 'Cart item removed.',
            'cart' => $updatedCart
        ]);
    }
}
