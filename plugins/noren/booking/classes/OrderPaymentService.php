<?php

namespace Noren\Booking\Classes;

use Noren\Booking\Models\Order;
use Log;
use Mail;

class OrderPaymentService
{
    public function handle(int $method, string $externalId, int $status, $body): void
    {
        $order = $this->getOrder($externalId);
        if (!$order) {
            return;
        }

        $this->updateOrder($order, $status);
        $this->addPayment($method, $order, $status, $body);
    }

    protected function getOrder(string $externalId): ?Order
    {
        $order = Order::where('external_id', $externalId)
                      ->where('status_id', 1)
                      ->first();

        if (!$order) {
            Log::warning("Order not found or already processed: $externalId");
            return null;
        }

        return $order;
    }

    protected function updateOrder(Order $order, int $status): void
    {
        if ($status === 1) {
            $order->status_id = 2;//confirmed
            $order->payment_status_id = ($order->deposite == 100) ? 2 : 3; //2 fullpayd 3 partial payd


        } else {
            $order->status_id = 3;//deleded
            $order->payment_status_id = 4;//expired
        }

        $order->save();

        //Log::info("Order #{$order->id} updated. Status: {$order->status_id}, Payment Status: {$order->payment_status_id}");
    }

    protected function addPayment(int $method, Order $order, int $status, $body): void
    {
        $order->payment()->create([
            'body' => $body,
            'method' => $method,
            'status' => $status,
        ]);

        //Log::info("Payment added for Order #{$order->id} with status $status.");
    }
}
