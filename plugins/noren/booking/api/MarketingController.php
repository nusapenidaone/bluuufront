<?php

namespace Noren\Booking\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class MarketingController extends Controller
{
    private string $token   = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjQyYTJlNjYxODA2MGNlZWNhNTIwMGU0ZmFlMzc3ODgyMWZlNDE4ZDEwYmY2M2U5NDhhMmZmMzBmODNkYmIwMmQ4NDJhNzhhMDE1NWVhMWRlIn0.eyJhdWQiOiI0M2RhOGRkYS1hNDdmLTRmNWItOTk3Ny04YTk3MTNkYzhkNGUiLCJqdGkiOiI0MmEyZTY2MTgwNjBjZWVjYTUyMDBlNGZhZTM3Nzg4MjFmZTQxOGQxMGJmNjNlOTQ4YTJmZjMwZjgzZGJiMDJkODQyYTc4YTAxNTVlYTFkZSIsImlhdCI6MTc1NDQ2Mzc1MiwibmJmIjoxNzU0NDYzNzUyLCJleHAiOjE4OTMzNjk2MDAsInN1YiI6IjgzNTY2MzEiLCJncmFudF90eXBlIjoiIiwiYWNjb3VudF9pZCI6MzAyMjY3NjMsImJhc2VfZG9tYWluIjoia29tbW8uY29tIiwidmVyc2lvbiI6Miwic2NvcGVzIjpbImNybSIsImZpbGVzIiwiZmlsZXNfZGVsZXRlIiwibm90aWZpY2F0aW9ucyIsInB1c2hfbm90aWZpY2F0aW9ucyJdLCJ1c2VyX2ZsYWdzIjowLCJoYXNoX3V1aWQiOiJhOTg3ZGFhOC1jOWJkLTQyNWQtYjA5Yi00YjVhNjI0MWQzMGEiLCJhcGlfZG9tYWluIjoiYXBpLWcua29tbW8uY29tIn0.AkYkZCdugdCCIxXuLPM5Ikm-LBozNrFn2yT75JRdthdCHZjM7BbhL07kyqnzE-vcReaelF4dtbLOlNlMUmY5h3Cpm37VYYmD2zrMhkhEO40_Yd-60arQH7tozM39ZKtgSS195Z4BMo5HGF5jHZJcYN8byplIovL5Zayct6-S4DNerbO5xk8drY47s--tIdqzkSH1QMIkRipcD5IrHo_8IsWdVG2ar3LydBJG-xYe50UHFO590493pEts40zh2Yxs1qRDfOu-0qI-BWl5Pof8ROyCgYXXHaTW0qyXodLxjsJGmkyexWtiTh38LwBaDASosxBdulc_lk7lP2iTPNO_tQ';
    private string $baseUrl = 'https://baliboattours.kommo.com';

    private array $utmFieldMap = [
        'utm_content'  => 110692,
        'utm_medium'   => 110694,
        'utm_campaign' => 110696,
        'utm_source'   => 110698,
        'utm_term'     => 110700,
        'utm_referrer' => 110702,
    ];

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

        $contactCustomFields = [];

        if ($whatsapp) {
            $contactCustomFields[] = [
                'field_code' => 'PHONE',
                'values'     => [['value' => $whatsapp, 'enum_code' => 'WORK']],
            ];
        }

        if ($email) {
            $contactCustomFields[] = [
                'field_code' => 'EMAIL',
                'values'     => [['value' => $email, 'enum_code' => 'WORK']],
            ];
        }

        $leadCustomFields = [];
        foreach ($this->utmFieldMap as $utmKey => $fieldId) {
            if (!empty($utm[$utmKey])) {
                $leadCustomFields[] = [
                    'field_id' => $fieldId,
                    'values'   => [['value' => $utm[$utmKey]]],
                ];
            }
        }

        if ($groupSize > 0) {
            $leadCustomFields[] = [
                'field_id' => 187664,
                'values'   => [['value' => (string) $groupSize]],
            ];
        }

        $payload = [[
            'name'                 => 'Bluuu Marketing — ' . $name,
            'custom_fields_values' => $leadCustomFields ?: null,
            '_embedded'            => [
                'contacts' => [[
                    'name'                 => $name,
                    'custom_fields_values' => $contactCustomFields,
                ]],
            ],
        ]];

        $ch = curl_init($this->baseUrl . '/api/v4/leads/complex');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($payload),
            CURLOPT_HTTPHEADER     => [
                'Authorization: Bearer ' . $this->token,
                'Content-Type: application/json',
            ],
            CURLOPT_TIMEOUT        => 30,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            return response()->json(['error' => 'CRM connection error', 'detail' => $curlError], 502);
        }

        if ($httpCode >= 200 && $httpCode < 300) {
            return response()->json(['success' => true]);
        }

        return response()->json(
            ['error' => 'CRM error', 'status' => $httpCode, 'body' => json_decode($response)],
            502
        );
    }
}
