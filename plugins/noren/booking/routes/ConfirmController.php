<?php

namespace Noren\Booking\Routes;
use Illuminate\Routing\Controller;

use Illuminate\Http\Request;
use Session;
use Log;
use Mail;

use Noren\Booking\Models\Order;
use Noren\Booking\Models\Rates;

use Noren\Booking\Classes\KommoService;
use Noren\Booking\Classes\XenditService;
use Noren\Booking\Classes\PayPalService;

use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;

class ConfirmController extends Controller
{
    public function setConfirm(Request $request)
    {
        if(Session::token()!= request()->header('X-CSRF-TOKEN')) return response('Unauthorized.', 401);
        $data = $request->all();
        
        self::sendNote($data);
        
		if($data['pay']==true){
			
	        //если метод оплаты xendit
	        if($data['method']==1){
	            $url = XenditService::createPaymentLink(
	                $orderId = (string)$data['lead_id'],
	                $amount = $data['collect'],
	                $email = $data['email'],
	                $returnUrl = url('/registration/qr'),
	                $cancelUrl = url('/error'),
	                $description="Payment of the remaining amount ".$amount
	            );
	        //если метод оплаты paypal
	        }elseif($data['method']==2){
	            $usd_rate=Rates::find(2)->rate;
	            $usd_summ=$usd_rate * $data['collect'];
	            $url = PayPalService::createPaymentLink(
	                $orderId = (string)$data['lead_id'],
	                $amount = $usd_summ,
	                $email = $data['email'],
	                $returnUrl = url('/registration/qr'),
	                $cancelUrl = url('/error'),
	                $description="Payment of the remaining amount ".$amount
	            );
	                
	        }
			
		}else{
        	 $url = url('/registration/qr');
        }
        
        return response()->json($url);
    }
    
    
	private function generateQr($text){
	    $options = new QROptions([
	        'outputType' => QRCode::OUTPUT_IMAGE_PNG,
	        'scale' => 9,
	    ]);
	    $qrcode = new QRCode($options);
	    $qr=$qrcode->render($text);
	    return $qr;
	}
	
	private function sendNote($data){
		
		
        $odoo_id=$data['odoo_id'];
 
		$vars = ['odoo_id' => $odoo_id, 'name'=>$data['name'], 'time'=>$data['travel_time'], 'date'=>$data['travel_date'], 'meeting'=>$data['meeting_point']];
    
        Mail::send('registration', $vars, function ($message) use ($data){
            $message->to($data['email']);
        });


		$text = "AMENDMENTS\n";
		$text .= "LEAD CONFIRMED\n";
		
		if (!empty($data['name'])) {
		    $text .= "Name: {$data['name']}\n";
		}
		
		// Добавляем email только если указан
		if (!empty($data['email'])) {
		    $text .= "Email: {$data['email']}\n";
		}
		
		// Добавляем телефон/WhatsApp, только если указан
		if (!empty($data['phone'])) {
		    $text .= "Whatsapp: {$data['phone']}\n";
		}
		if (!empty($data['pay']) && $data['pay'] == true) {
		    $text .= "Customer initiated payment of the remaining amount\n";
		}
		
		// Собираем пассажиров
		$travellersList = [];
		
		foreach ($data['passengers'] as $t) {
		    // Проверяем, что есть хотя бы ИМЯ — иначе пассажира нет
		    if (empty($t['name'])) continue;
		
		    // Строим строку по заполненным параметрам
		    $row = $t['name'];
		
		    if (!empty($t['age']))    $row .= " - ".$t['age'];
		    if (!empty($t['gender'])) $row .= " - ".$t['gender'];
		    if (!empty($t['country']))$row .= " - ".$t['country'];
		
		    $travellersList[] = $row;
		}
		
		// Добавляем блок только если есть пассажиры
		if (count($travellersList) > 0) {
		    $text .= "\nTravellers\n";
		    $text .= implode("\n", $travellersList);
		}
		
		$note = [
		    [
		        "note_type" => "common",
		        "entity_id" => $data['lead_id'],
		        "params" => [
		            "text" => $text
		        ]
		    ]
		];



	    
        $k=KommoService::sendNote($note);
		
		
	}
	
	
    
}