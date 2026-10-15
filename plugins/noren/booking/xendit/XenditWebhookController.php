<?php namespace Noren\Booking\Xendit;

use Illuminate\Routing\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Noren\Booking\Classes\OrderPaymentService;
use Noren\Booking\Models\Order;
use Noren\Booking\Odoo\OdooService;
use Cache;
use Log;

/**
 * POST /api/xendit/webhook — замена routes/VerifyController::VerifyXendit.
 *
 * Отличия от старого:
 *  - токен сравнивается через hash_equals;
 *  - статус и сумма берутся не из тела запроса, а из перезапроса инвойса у Xendit;
 *  - идемпотентность: повтор вебхука (Xendit ретраит при таймауте/5xx) не
 *    засчитывает доплату в Odoo второй раз;
 *  - явная обработка PAID/SETTLED и EXPIRED, остальные статусы игнорируются
 *    (старый код любой не-PAID статус считал отменой);
 *  - для заказов сайта сверяется оплаченная сумма с ожидаемой (пока только лог).
 */
class XenditWebhookController extends Controller
{
    const METHOD_ID = 1; // Xendit в noren_booking_payment.method / Order.method_id

    public function handle(Request $request)
    {
        $config = XenditService::config();

        $received = (string) $request->header('X-Callback-Token', '');
        if ($received === '' || !hash_equals($config['callback_token'], $received)) {
            Log::warning('[XenditV2] Invalid X-Callback-Token');
            return Response::make('Forbidden', 403);
        }

        $rawBody   = $request->getContent();
        $invoiceId = (string) $request->input('id', '');

        if ($invoiceId === '') {
            Log::warning('[XenditV2] Webhook without invoice id', ['body' => $rawBody]);
            return response('ok', 200);
        }

        // Источник правды — сам Xendit. Если он недоступен, отвечаем 503:
        // Xendit повторит вебхук позже.
        try {
            $invoice = XenditService::getInvoice($invoiceId);
        } catch (\Throwable $e) {
            return response('retry', 503);
        }

        if (!$invoice) {
            Log::warning('[XenditV2] Invoice not found at Xendit', ['invoice_id' => $invoiceId]);
            return response('ok', 200);
        }

        $externalId = (string) ($invoice['external_id'] ?? '');
        $status     = strtoupper((string) ($invoice['status'] ?? ''));
        $isPaid     = in_array($status, ['PAID', 'SETTLED'], true);
        $isExpired  = $status === 'EXPIRED';
        $paidAmount = (float) ($invoice['paid_amount'] ?? $invoice['amount'] ?? 0);

        if (!$isPaid && !$isExpired) {
            Log::info('[XenditV2] Ignored status', ['invoice_id' => $invoiceId, 'external_id' => $externalId, 'status' => $status]);
            return response('ok', 200);
        }

        // Параллельные повторы одного и того же инвойса — обрабатывает только первый.
        $lockKey = 'xendit_v2_webhook_' . $invoiceId;
        if (!Cache::add($lockKey, 1, 600)) {
            Log::info('[XenditV2] Duplicate webhook in progress, skipped', ['invoice_id' => $invoiceId]);
            return response('ok', 200);
        }

        try {
            if (str_starts_with($externalId, 'bluuu')) {
                $this->handleSiteOrder($externalId, $isPaid, $paidAmount, $rawBody);
            } elseif (str_starts_with($externalId, 'odoo_')) {
                if ($isPaid) {
                    $this->handleOdooCollect($externalId, $invoiceId, $paidAmount);
                }
            } else {
                Log::info('[XenditV2] Unknown external_id prefix, ignored', ['external_id' => $externalId, 'status' => $status]);
            }
        } catch (\Throwable $e) {
            // Снимаем лок, чтобы ретрай Xendit смог обработать заново.
            Cache::forget($lockKey);
            Log::error('[XenditV2] Webhook processing failed: ' . $e->getMessage(), [
                'invoice_id' => $invoiceId, 'external_id' => $externalId, 'trace' => $e->getTraceAsString(),
            ]);
            return response('retry', 500);
        }

        return response('ok', 200);
    }

    /**
     * Заказ сайта (bluuu<timestamp>). OrderPaymentService сам идемпотентен —
     * берёт только ордер со status_id=1, повтор после подтверждения ничего не делает.
     */
    protected function handleSiteOrder(string $externalId, bool $isPaid, float $paidAmount, string $rawBody): void
    {
        if ($isPaid) {
            $order = Order::where('external_id', $externalId)->first();
            if ($order) {
                $expected = $this->expectedSiteCharge($order);
                if ($paidAmount + 1 < $expected) {
                    Log::warning('[XenditV2] Paid amount lower than expected', [
                        'external_id' => $externalId, 'paid' => $paidAmount, 'expected' => $expected,
                    ]);
                }
            }
        }

        (new OrderPaymentService)->handle(self::METHOD_ID, $externalId, $isPaid ? 1 : 2, $rawBody);
    }

    /**
     * Доплата остатка Odoo-ордера (odoo_{id}[_f{fee}][_{nonce}]).
     * В x_studio_payment_reference пишется "external_id / invoice_id" — по invoice_id
     * проверяем, не засчитан ли этот платёж уже (повторный вебхук).
     */
    protected function handleOdooCollect(string $externalId, string $invoiceId, float $paidAmount): void
    {
        if (!preg_match('/^odoo_(\d+)(?:_f(\d+))?/', $externalId, $m)) {
            Log::warning('[XenditV2] Malformed odoo external_id', ['external_id' => $externalId]);
            return;
        }

        $odooOrderId = (int) $m[1];
        $feeAmount   = (float) ($m[2] ?? 0);

        $rows = OdooService::post('/json/2/sale.order/search_read', [
            'domain' => [['id', '=', $odooOrderId]],
            'fields' => ['x_studio_payment_reference'],
            'limit'  => 1,
        ]);

        if (empty($rows[0])) {
            Log::warning('[XenditV2] Odoo order not found', ['odoo_id' => $odooOrderId, 'external_id' => $externalId]);
            return;
        }

        $reference = (string) ($rows[0]['x_studio_payment_reference'] ?? '');

        // Уже засчитан, если в reference есть invoice id (пишет этот вебхук) или —
        // для уникального external_id с nonce-суффиксом — сам external_id (так пишет
        // старый VerifyController). Легаси-номера без суффикса (odoo_{id}[_f{fee}])
        // повторяются между попытками, по ним сверять нельзя.
        $alreadyRegistered = str_contains($reference, $invoiceId);
        if (!$alreadyRegistered && preg_match('/^odoo_\d+(?:_f\d+)?_\d+$/', $externalId)) {
            foreach (preg_split('/\R/', $reference) as $line) {
                $line = trim($line);
                if ($line === $externalId || str_starts_with($line, $externalId . ' ')) {
                    $alreadyRegistered = true;
                    break;
                }
            }
        }

        if ($alreadyRegistered) {
            Log::info('[XenditV2] Payment already registered, skipped', ['odoo_id' => $odooOrderId, 'invoice_id' => $invoiceId]);
            return;
        }

        OdooService::registerPayment(
            $odooOrderId,
            $paidAmount - $feeAmount,
            'x_studio_collected_by_xendit',
            $externalId . ' / ' . $invoiceId,
            $feeAmount
        );
    }

    /** Та же формула, что в Private/SharedOrderController::createPaymentLink. */
    protected function expectedSiteCharge(Order $order): float
    {
        $donation = (float) ($order->donation_amount ?? 0);

        if ($order->deposite == 100) {
            return round($order->deposite_summ * 1.025) + $donation;
        }

        return (float) $order->deposite_summ + $donation;
    }
}
