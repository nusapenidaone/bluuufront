<?php namespace Noren\Booking\Doku;

use Illuminate\Routing\Controller;
use Illuminate\Http\Request;

// Временный контроллер для ручного теста DokuService — создаёт checkout-сессию
// с тестовыми данными и редиректит на страницу оплаты DOKU. Удалить после теста.
class DokuTestController extends Controller
{
    // GET /api/doku/test?amount=10000&email=test@example.com&description=Test+payment
    public function test(Request $request)
    {
        $orderId     = 'bluuu_test_' . time();
        $amount      = (float) $request->query('amount', 10000);
        $email       = (string) $request->query('email', 'test@example.com');
        $description = (string) $request->query('description', 'Test payment');

        $url = DokuService::createPaymentLink(
            $orderId,
            $amount,
            $email,
            'https://bluuu.tours/private',
            'https://bluuu.tours/private',
            $description
        );

        return redirect($url);
    }
}
