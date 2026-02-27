<?php

namespace Noren\Booking\Routes;

use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Session;
use Noren\Booking\Models\Promocode;

class PromoController extends Controller
{
	public function checkPromo($id, $code)
	{
	    // Ищем промокод
	    $promocode = Promocode::with('agent','tours')->where('code', $code)->first();
	
	    // Если промокод не найден
	    if (!$promocode) {
	        return Response::json([
	            'error' => true,
	            'message' => 'Promo code not found'
	        ], 404);
	    }
	
	    // Проверяем, связан ли тур с промокодом
	    $isLinked = $promocode->tours()->where('id', $id)->exists();
	
	    if ($isLinked) {
	        return Response::json([
	            'code'       => $promocode->code,
	            'agent_fee'  => $promocode->agent_fee,
	            'discount'   => $promocode->discount,
	            'agent_name' => $promocode->agent->name ?? null,
	        ]);
	    }
	
	    // Если тур не связан с этим промокодом
	    return Response::json([
	        'error' => true,
	        'message' => 'Promo code is not valid for this tour'
	    ], 400);
	}

}

