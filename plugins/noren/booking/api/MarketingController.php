<?php

namespace Noren\Booking\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Noren\Booking\RespondIo\RespondIoService;

class MarketingController extends Controller
{
    public function lead(Request $request)
    {
        $name      = trim($request->input('name', ''));
        $email     = trim($request->input('email', ''));
        $whatsapp  = trim($request->input('whatsapp', ''));
        $groupSize = (int) $request->input('groupSize', 0);
        $utm       = $request->input('utm', []);
        $utm       = is_array($utm) ? $utm : [];

        if (!$name || (!$email && strlen($whatsapp) < 4)) {
            return response()->json(
                ['error' => 'Name and at least one contact method required'],
                400
            );
        }

        RespondIoService::sendMarketingLead([
            'name'      => $name,
            'email'     => $email,
            'whatsapp'  => $whatsapp,
            'groupSize' => $groupSize,
            'utm'       => $utm,
        ]);

        return response()->json(['success' => true]);
    }
}
