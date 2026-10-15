<?php namespace Noren\Booking\Xendit;

use Illuminate\Routing\Controller;
use Illuminate\Http\Request;

// Временный контроллер для ручного теста XenditService. Удалить после теста.
// external_id 'xendit_test_*' вебхук игнорирует — ни заказы, ни Odoo не трогаются.
class XenditTestController extends Controller
{
    // GET /api/xendit/test?amount=10000&email=test@example.com&description=Test+payment
    public function test(Request $request)
    {
        try {
            $invoice = XenditService::createInvoice(
                'xendit_test_' . time(),
                (float) $request->query('amount', 10000),
                (string) $request->query('email', 'test@example.com'),
                'https://bluuu.tours/private',
                'https://bluuu.tours/private',
                (string) $request->query('description', 'Test payment')
            );
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 502);
        }

        if ($request->query('json')) {
            return response()->json($invoice);
        }

        return redirect($invoice['url']);
    }

    // GET /api/xendit/status/{invoice_id}
    public function status(string $invoiceId)
    {
        try {
            $invoice = XenditService::getInvoice($invoiceId);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 502);
        }

        if (!$invoice) {
            return response()->json(['error' => 'Not found'], 404);
        }

        return response()->json([
            'id'          => $invoice['id'] ?? null,
            'external_id' => $invoice['external_id'] ?? null,
            'status'      => $invoice['status'] ?? null,
            'amount'      => $invoice['amount'] ?? null,
            'paid_amount' => $invoice['paid_amount'] ?? null,
            'paid_at'     => $invoice['paid_at'] ?? null,
            'expiry_date' => $invoice['expiry_date'] ?? null,
        ]);
    }
}
