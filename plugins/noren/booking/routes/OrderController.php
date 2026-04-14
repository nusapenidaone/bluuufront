<?php

namespace Noren\Booking\Routes;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Session;

use Noren\Booking\Models\Order;
use Noren\Booking\Models\Rates;
use Noren\Booking\Models\Tours;
use Noren\Booking\Models\Closeddates;

use Noren\Booking\Classes\XenditService;
use Noren\Booking\Classes\PayPalService;
use Log;
use Noren\Booking\Classes\ArrayDiff;



class OrderController extends Controller
{
    public function createOrder(Request $request)
    {
        if(Session::token()!= request()->header('X-CSRF-TOKEN')) return response('Unauthorized.', 401);
        $data = $request->all();
        
        $order=new Order;
        if($data['deposite']>0){
            $order->order_type_id=1;//order
            $order->status_id=1;//new
            $order->payment_status_id=1;//pending

        }else{
            $order->order_type_id=2;//request
            $order->status_id=4;//pending request
            $order->payment_status_id=5; //not paid
        }
        
        
		if (Session::has('utm')) {
		    $order->utm=Session::get('utm');
		    Session::forget('utm');
		}

        $order->ga_client_id=$data['ga_client_id'] ?? null;
        $order->amo_lead_id=$data['leadId'];
        $order->tours_id=$data['tourId'];

        $order->boat_id=$this->selectBoatForOrder(
            (int) $data['tourId'],
            $data['travelDate'],
            ($data['adults'] ?? 0) + ($data['kids'] ?? 0)
        );

        $order->travel_date=$data['travelDate'];
        $order->adults=$data['adults'];
        $order->children=$data['children'];
        $order->kids=$data['kids'];
        $order->members=$data['members'];
        $order->cars=$data['cars'];
        
        $order->transfer_id=$data['selectedTransferId'];
        $order->cover_id=$data['selectedCoverId'];
        $order->program_id=$data['selectedProgramId'];
        $order->restaurant_id=$data['selectedRestaurantId'];
        
        $order->boat_price=$data['boatPrice'];
        $order->tour_price=$data['tourPrice'];
        
        $order->transfer_price=$data['transferPrice'];
        $order->cover_price=$data['coverPrice'];
        $order->program_price=$data['programPrice'];        
        $order->extras_total=$data['extrasTotal'];
        
        $order->total_price=$data['totalPrice'];
        $order->full_price=$data['fullPrice'];
        $order->discount_price=$data['discountPrice'];
        
        $order->discount = $data['discount'] ?? 0;

        $order->promocode=$data['promocode'];
        $order->deposite=$data['deposite'];
        $order->agent_fee=$data['agent_fee'];
        $order->agent_name=$data['agent_name'];
        
        if($data['deposite']>0){
            $order->method_id=$data['method'];
            $order->deposite_summ=$data['totalPrice']*$data['deposite']/100;
        }
        
        $order->extras=$data['selectedExtras'];
        $order->name=$data['name'];
        $order->email=$data['email'];
        $order->whatsapp=$data['whatsapp'];
        $order->requests=$data['requests'];
        $order->pickup_address=$data['pickupAddress'];
        $order->dropoff_address=$data['dropoffAddress'];
        $order->save();
        
        Session::put('order_id', $order->id);
        //если лодка партнерская отправлаем на страницу спасибо
        if($data['deposite']==0) {
            $returnUrl = url('/success/request-success');
            return response()->json($returnUrl);
        }

        //если метод оплаты xendit
        if($order->method_id==1){
            $url = XenditService::createPaymentLink(
                $orderId = $order->external_id,
                $amount = $order->deposite_summ,
                $email = $order->email,
                $returnUrl = url('/success/payment-success'),
                $cancelUrl = url('/error'),
                $description=$order->tours->name
            );
        //если метод оплаты paypal
        }else{
            $usd_rate=Rates::find(2)->rate;
            $usd_summ=$usd_rate * $order->deposite_summ;
            $url = PayPalService::createPaymentLink(
                $orderId = $order->external_id,
                $amount = $usd_summ,
                $email = $order->email,
                $returnUrl = url('/success/payment-success'),
                $cancelUrl = url('/error'),
                $description=$order->tours->name
                
            );
                
        }
        
        return response()->json($url);
    }

    /**
     * Select the best available boat for an order.
     *
     * Private (classes_id=8): first boat with no closeddates on the date.
     *   - Any closeddate (shared/private/manual/cron) blocks the boat.
     *
     * Shared (classes_id=9): first boat (by sort_order) with enough free capacity.
     *   - type=1 records count against capacity; type=2/3/4 fully block the boat.
     */
    protected function selectBoatForOrder(int $tourId, string $date, int $members): ?int
    {
        $tour = Tours::with(['boat' => function ($q) {
            $q->orderBy('sort_order')->orderBy('id');
        }])->find($tourId);

        if (!$tour || $tour->boat->isEmpty()) return null;

        $isPrivate = (int) $tour->types_id !== 1;

        foreach ($tour->boat as $boat) {
            if (!empty($boat->closed)) continue;

            $records = Closeddates::where('boat_id', $boat->id)
                ->where('date', $date)
                ->whereNull('deleted_at')
                ->get();

            // type 2/3/4 fully blocks the boat for both private and shared
            $blocked = $records->contains(fn($r) => in_array((int) $r->type, [2, 3, 4]));
            if ($blocked) continue;

            if ($isPrivate) {
                // Private: boat must have zero closeddates (shared bookings also block it)
                if ($records->isEmpty()) return $boat->id;
            } else {
                // Shared: check remaining capacity
                $booked = $records->where('type', 1)->sum('qtty');
                $available = max(0, (int) $boat->capacity - (int) $booked);
                if ($available >= $members) return $boat->id;
            }
        }

        return null;
    }
}