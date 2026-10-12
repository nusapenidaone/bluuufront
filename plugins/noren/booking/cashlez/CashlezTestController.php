<?php namespace Noren\Booking\Cashlez;

use Illuminate\Routing\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Log;

/**
 * ВРЕМЕННЫЙ контроллер для ручной проверки Cashlez Link. Удалить после теста.
 *
 * ВНИМАНИЕ: sandbox у Cashlez нет — оплата настоящая. Тестировать на
 * минимальной сумме (в примерах самого Cashlez это IDR 2).
 *
 * Оба эндпоинта закрыты секретом ?t=<test_token> из services.config.php,
 * иначе генерацию ссылок на проде смог бы дёргать кто угодно.
 */
class CashlezTestController extends Controller
{
    // GET /api/cashlez/test?t=<token>&amount=2000&name=Test+Customer&phone=08123456789
    public function test(Request $request)
    {
        if (!$this->authorized($request)) {
            return Response::make('Forbidden', 403);
        }

        $referenceId  = 'bluuu_test_' . time();
        $amount       = (float) $request->query('amount', 2000);
        $customerName = (string) $request->query('name', 'Test Customer');
        $phone        = (string) $request->query('phone', '08123456789');
        $returnUrl    = (string) $request->query('return', 'https://bluuu.tours/private');

        try {
            $data = CashlezService::generate(
                $referenceId,
                $amount,
                $customerName,
                $phone,
                $returnUrl
            );
        } catch (\Throwable $e) {
            Log::error('[Cashlez] Test generate failed: ' . $e->getMessage());

            // На тесте показываем ошибку как есть, а не редиректим на cancel —
            // нужно видеть, что именно ответил Cashlez.
            return Response::make('Cashlez error: ' . $e->getMessage(), 502);
        }

        // Логируем связку reference_id <-> order_id, чтобы потом сматчить callback.
        Log::info('[Cashlez] Test link created', [
            'reference_id'   => $referenceId,
            'order_id'       => $data['order_id'] ?? null,
            'invoice_num'    => $data['invoice_num'] ?? null,
            'base_amount'    => $data['base_amount'] ?? null,
            'generated_link' => $data['generated_link'] ?? null,
        ]);

        return redirect($data['generated_link']);
    }

    // GET /api/cashlez/status/{order_id}?t=<token>
    // order_id — UUID из ответа generate (см. лог "Test link created").
    public function status(Request $request, $orderId)
    {
        if (!$this->authorized($request)) {
            return Response::make('Forbidden', 403);
        }

        try {
            $data = CashlezService::checkStatus((string) $orderId);
        } catch (\Throwable $e) {
            Log::error('[Cashlez] Test status failed: ' . $e->getMessage());

            return Response::make('Cashlez error: ' . $e->getMessage(), 502);
        }

        return response()->json($data);
    }

    protected function authorized(Request $request): bool
    {
        $token = CashlezService::config()['test_token'] ?? '';

        if (!$token) {
            return false;
        }

        return hash_equals($token, (string) $request->query('t', ''));
    }
}
