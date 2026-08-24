<?php namespace Noren\Booking\Doku;

use Illuminate\Routing\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Noren\Booking\Classes\OrderPaymentService;
use Noren\Booking\Odoo\OdooService;
use Log;

class DokuWebhookController extends Controller
{
    const NOTIFICATION_PATH = '/api/doku/webhook';

    public function handle(Request $request)
    {
        $rawBody = $request->getContent();

        $signatureValid = $this->verifySignature($request, $rawBody);

        $payload = json_decode($rawBody, true) ?: [];

        $externalId = $payload['order']['invoice_number'] ?? null;
        $status     = strtoupper($payload['transaction']['status'] ?? '');
        $amount     = (float) ($payload['order']['amount'] ?? 0);
        $isPaid     = in_array($status, ['SUCCESS', 'SETTLEMENT']);

        if (!$signatureValid) {
            Log::warning('[Doku] Invalid webhook signature');
            return Response::make('Forbidden', 403);
        }

        if (!$externalId) {
            Log::warning('[Doku] Missing invoice_number in webhook', ['payload' => $payload]);
            return response('ok', 200);
        }

        if (str_starts_with($externalId, 'bluuu')) {
            (new OrderPaymentService)->handle(3, $externalId, $isPaid ? 1 : 2, $rawBody);
        } elseif (str_starts_with($externalId, 'odoo_')) {
            if ($isPaid) {
                $odooOrderId = (int) str_replace('odoo_', '', $externalId);
                OdooService::registerPayment($odooOrderId, $amount, 'x_studio_collected_by_doku', $externalId);
            }
        }

        return response('ok', 200);
    }

    protected function verifySignature(Request $request, string $rawBody): bool
    {
        $clientId  = $request->header('Client-Id');
        $requestId = $request->header('Request-Id');
        $timestamp = $request->header('Request-Timestamp');
        $signature = $request->header('Signature');

        if (!$clientId || !$requestId || !$timestamp || !$signature) {
            return false;
        }

        $config = DokuService::config();

        if ($clientId !== $config['client_id']) {
            return false;
        }

        $digest = base64_encode(hash('sha256', $rawBody, true));

        $stringToSign = "Client-Id:{$clientId}\n"
            . "Request-Id:{$requestId}\n"
            . "Request-Timestamp:{$timestamp}\n"
            . "Request-Target:" . self::NOTIFICATION_PATH . "\n"
            . "Digest:{$digest}";

        $expected = 'HMACSHA256=' . base64_encode(hash_hmac('sha256', $stringToSign, $config['secret_key'], true));

        return hash_equals($expected, $signature);
    }
}
