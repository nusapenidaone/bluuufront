<?php namespace Noren\Booking\Doku;

use Illuminate\Routing\Controller;
use Illuminate\Http\Request;

// Временный контроллер для ручного теста DokuService — создаёт checkout-сессию
// с тестовыми данными и редиректит на страницу оплаты DOKU. Удалить после теста.
class DokuTestController extends Controller
{
    public function test(Request $request)
    {
        $orderId = 'bluuu_test_' . time();

        $url = DokuService::createPaymentLink(
            $orderId,
            10000, // IDR
            'test@example.com',
            'https://bluuu.tours/private',
            'https://bluuu.tours/private',
            'Test payment'
        );

        return redirect($url);
    }
}
