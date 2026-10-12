<?php

namespace Noren\Booking\Routes;
use Illuminate\Routing\Controller;

use Input;
use Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

use Noren\Booking\Classes\OrderPaymentService;
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

	    } elseif (str_starts_with($external_id, 'odoo_')) {

	    	if ($statusValue === 'PAID' && preg_match('/^odoo_(\d+)(?:_f(\d+))?/', $external_id, $m)) {
	    		$odooOrderId = (int) $m[1];
	    		$feeAmount   = (float) ($m[2] ?? 0);
	    		$amount      = (float) $request->input('amount');
	    		OdooService::registerPayment($odooOrderId, $amount - $feeAmount, 'x_studio_collected_by_xendit', $external_id, $feeAmount);
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

    private function SendPayNote($lead_id, $amount, $description){
        // Kommo removed
    }
}
