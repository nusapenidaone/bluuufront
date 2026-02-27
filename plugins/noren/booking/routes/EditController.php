<?php

namespace Noren\Booking\Routes;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Noren\Booking\Models\Order;
use Noren\Booking\Models\Rates;
use Log;
use Mail;
use Noren\Booking\Classes\ArrayDiff;
use Noren\Booking\Classes\KommoService;

class EditController extends Controller
{

    public function updateOrder(Request $request)
    {
        $data = $request->all();

        // Удаляем ненужные поля
        unset(
            $data['currency'],
            $data['language'],
            $data['step'],
            $data['allMembers']
        );

        $order = Order::find($data['id']);
        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        // Старые данные
        $oldData = $order->toArray();

        // Пишем историю
        $history = $order->order_history()->create([
            'order_id' => $order->id,
            'old_data' => $oldData,
            'new_data' => $data,
            'status'   => true,
        ]);

        // Разница
        $difference = ArrayDiff::compare($oldData, $data);

        // -------------------------------
        //     NOTE GENERATION
        // -------------------------------

        $note = "Order updated:\n\n";

        foreach ($difference as $field => $value) {

            // Обновляем заказ
            $order->$field = $value['new'];

            switch ($field) {

                case 'tours_id':
                    $modelClass = "Noren\\Booking\\Models\\Tours";
                    $model = $modelClass::find($value['new']);
                    $note .= "Tour: " . ($model->name ?? '') . "\n";
                    break;

                case 'travel_date':
                    $note .= "Travel date: " . $value['new'] . "\n";
                    break;

                case 'adults':
                    $note .= "Adults: " . $value['new'] . "\n";
                    break;

                case 'kids':
                    $note .= "Kids: " . $value['new'] . "\n";
                    break;

                case 'children':
                    $note .= "Children: " . $value['new'] . "\n";
                    break;

                case 'cars':
                    $note .= "Cars: " . $value['new'] . "\n";
                    break;

                case 'program_id':
                    $modelClass = "Noren\\Booking\\Models\\Program";
                    $model = $modelClass::find($value['new']);
                    $note .= "Program: " . ($model->name ?? '') . "\n";
                    break;

                case 'transfer_id':
                    if ($value['new']) {
                        $modelClass = "Noren\\Booking\\Models\\Transfer";
                        $model = $modelClass::find($value['new']);
                        $note .= "Transfer: " . ($model->name ?? '') . "\n";
                    } else {
                        $note .= "Transfer: no transfer\n";
                    }
                    break;
                    
                    
                case 'pickup_address':
                    $note .= "Pickup address: " . $value['new'] . "\n";
                    break;
                    
                case 'dropoff_address':
                    $note .= "Dropoff address: " . $value['new'] . "\n";
                    break;

                case 'cover_id':
                    if ($value['new']) {
                        $modelClass = "Noren\\Booking\\Models\\Cover";
                        $model = $modelClass::find($value['new']);
                        $note .= "Cover: " . ($model->name ?? '') . "\n";
                    } else {
                        $note .= "Cover: no cover\n";
                    }
                    break;

                case 'restaurant_id':
                    $modelClass = "Noren\\Booking\\Models\\Restaurant";
                    $model = $modelClass::find($value['new']);
                    $note .= "Restaurant: " . ($model->name ?? '') . "\n";
                    break;

                case 'total_price':
                    $note .= "Total price: " . $value['new'] . "\n";
                    break;

                // -------------------------------------
                //              EXTRAS (только изменённые)
                // -------------------------------------
                case 'extras':

                    $oldExtras = $value['old'] ?? [];
                    $newExtras = $value['new'] ?? [];

                    $note .= "Extras changes:\n";

                    // если вообще нечего сравнивать
                    if (empty($oldExtras) && empty($newExtras)) {
                        $note .= "- none\n";
                        break;
                    }

                    // индексируем по name
                    $old = [];
                    foreach ($oldExtras as $item) {
                        $old[$item['name']] = $item;
                    }

                    $new = [];
                    foreach ($newExtras as $item) {
                        $new[$item['name']] = $item;
                    }

                    // 1) Добавленные extras
                    foreach ($new as $name => $item) {
                        if (!isset($old[$name])) {
                            $qty = $item['qty'] ?? 1;
                            $note .= "+ Added: {$name} x{$qty}\n";
                        }
                    }

                    // 2) Удалённые extras
                    foreach ($old as $name => $item) {
                        if (!isset($new[$name])) {
                            $qty = $item['qty'] ?? 1;
                            $note .= "- Removed: {$name} x{$qty}\n";
                        }
                    }

                    // 3) Изменение количества
                    foreach ($new as $name => $newItem) {
                        if (isset($old[$name])) {

                            $oldQty = $old[$name]['qty'] ?? 0;
                            $newQty = $newItem['qty'] ?? 0;

                            if ($oldQty != $newQty) {
                                $note .= "* Changed: {$name} {$oldQty} → {$newQty}\n";
                            }
                        }
                    }
                    break;
            }
        }

        // Сохраняем заказ
        $order->save();
        $lead_id=$order->amo_lead_id;
		self::sendNote($lead_id, $note);
		self::sendEmail($order, $note);
        return response()->json(url('/success/edit-success'));
    }
    
    public function cancelOrder(Request $request)
    {
    	$id = $request->input('id');
    	$order = Order::find($id);
    	$lead_id=$order->amo_lead_id;
    	$order->status_id=5;
    	$order->save();
    	
    	$note='Lead canceled by user';
    	self::sendNote($lead_id, $note);
    	self::sendEmail($order, $note);
    	return response()->json(url('/success/cancel-success'));
    	
    }
    
    private function sendNote($lead_id, $note){
        $dataForKommo = [
            [
                "note_type"=> "common",
                "entity_id"=> $lead_id,
                "params"=>[
                    "text"=>$note
                ]
            ]
        ];
    	
    	KommoService::sendNote($dataForKommo);
    }
    
    
    protected function sendEmail($order, $note)
    {
            try {
                $vars = ['order' => $order, 'note'=>$note];
    
    			if($order->status_id==2){
	  				Mail::send('updated', $vars, function ($message) use ($order) {
	                    $message->to($order->email, $order->name);
	                });
    			}
                Mail::send('edited', $vars, function ($message) {
                    $message->to('info@bluuu.tours');
                });
            
            } catch (\Exception $e) {
                Log::error("Email send error  #{$order->id}: " . $e->getMessage());
            }
    }


}
