<?php

namespace Noren\Booking\Routes;
use Illuminate\Routing\Controller;
use Noren\Booking\Classes\XenditService;
use Illuminate\Http\Request;

class PaylinkController extends Controller
{
	public function generate(Request $request){
		$data=$request->all();
		$orderId=$data['lead_id'];
		$description=$data['description'];
		$amount=$data['amount'];
		
		
		$link=XenditService::createLink($orderId, $amount, url('/success/payment-success'), url('/error'), $description);
		return $link;
	}
}