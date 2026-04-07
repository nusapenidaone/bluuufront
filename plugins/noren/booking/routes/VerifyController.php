<?php

namespace Noren\Booking\Routes;
use Illuminate\Routing\Controller;

use Input;
use Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

use Noren\Booking\Classes\PayPalService;
use Noren\Booking\Classes\OrderPaymentService;
use Noren\Booking\Classes\KommoService;
use Noren\Booking\Models\Order;
use Noren\Booking\Odoo\OdooService;

class VerifyController extends Controller
{
	
	
    public function VerifyXendit(Request $request)
    {

        //$expectedToken="pqtyWs3aEw31TWndHKrs6kR0AGtRUiKaaLoHosu1jQsbRZJD"; //live bluuu
        $expectedToken="ALNVbGJkkmPWsiymxDm9FRlM7Y8dzK8BZDiWHbznbOHDfx99"; //live db
        //$expectedToken = 'CaEpxPKKwKhAFJn9YWMwNP3XZogEvpISpaTuPXQ00CJGewDG';//test
        $receivedToken = $request->header('X-Callback-Token');

        if ($receivedToken !== $expectedToken) {
            Log::warning('Invalid X-Callback-Token: ' . $receivedToken);
            return Response::make('Forbidden', 403);
        }


	    // Проверка наличия обязательных параметров
	    if (!$request->has('external_id')) {
	        Log::warning('Missing external_id in Xendit callback', ['data' => $request->all()]);
	        return response('ok', 200);
	    }
	    
	    $external_id = $request->input('external_id');
	    $statusValue = $request->input('status');
        

	    if (str_starts_with($external_id, 'bluuu')) {
	        $status = $statusValue === 'PAID' ? 1 : 2;
	        (new OrderPaymentService)->handle('1', $external_id, $status, $request->getContent());

	        if ($statusValue === 'PAID') {
	        	$order = Order::where('external_id', $external_id)->first();
	        	if ($order) {
	        		OdooService::registerWebPayment($order, (float) $request->input('amount'));
	        	}
	        }

	    } elseif (str_starts_with($external_id, 'odoo_')) {

	    	if ($statusValue === 'PAID') {
	    		$odooOrderId = (int) str_replace('odoo_', '', $external_id);
	    		$amount      = (float) $request->input('amount');
	    		OdooService::registerPayment($odooOrderId, $amount);
	    	}

	    } else {

	    	if($statusValue==='PAID'){
				$amount=$request->input('amount');
		        $description=$request->input('description');
		        $lead_id= $external_id;
				self::SendPayNote($lead_id, $amount, $description);
	    	}
	    }
	
	    return response('ok', 200);

    }

    public function VerifyPayPal(Request $request)
    {
        //6CW82812HE6002701 webhook id
        $event = $request->input('event_type');
        $resource = $request->input('resource');

        if (!$resource || !isset($resource['id'])) {
            Log::warning('Invalid PayPal webhook payload');
            return Response::make('Invalid Payload', 400);
        }

        $orderId = $resource['id'];
        $referenceId = $resource['purchase_units'][0]['reference_id'] ?? null;

        if (!$referenceId) {
            Log::warning('Missing reference_id in PayPal webhook');
            return Response::make('Missing reference_id', 400);
        }


        if ($event !== 'CHECKOUT.ORDER.APPROVED') {
            Log::info("Event $event — not approved, marking order as failed.");
            (new OrderPaymentService)->handle(2,$referenceId, 2, $request->getContent());
            return Response::make('OK', 200);
        }

        // Попытка захвата средств
        $captureResponse = PayPalService::capturePayment($orderId);
        
        $combinedData = [
            'webhook' => json_decode($request->getContent(), true),
            'capture' => $captureResponse,
        ];

        if (isset($captureResponse['status']) && $captureResponse['status'] === 'COMPLETED') {
        	
        	if(str_starts_with($referenceId, 'bluuu')){
            	(new OrderPaymentService)->handle(2,$referenceId, 1, $combinedData); //$request->getContent()
        	}else{
        		$amount = $resource['purchase_units'][0]['amount']['value'] ?? '';
        		$description=$resource['purchase_units'][0]['description'] ?? '';
        		$lead_id=$referenceId;
        		self::SendPayNote($lead_id, $amount, $description);
        	}
        } else {
            Log::warning("PayPal capture failed: " . json_encode($captureResponse));
            if(str_starts_with($referenceId, 'bluuu')){
            	(new OrderPaymentService)->handle(2,$referenceId, 2, $combinedData); //$request->getContent()
            }
           
        }

        return Response::make('OK', 200);
    }
    
    private function SendPayNote($lead_id, $amount, $description){

    	$data=[
		    [
		        "note_type"=> "common",
		        "entity_id"=> (int)$lead_id,
		        "params"=>[
		            "text"=>"Payment received amount: {$amount} description: {$description}"
		        ]
		    ]
		];
			    
		KommoService::sendNote($data);
    }
}
