<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

$name     = trim($data['name']     ?? '');
$email    = trim($data['email']    ?? '');
$whatsapp = trim($data['whatsapp'] ?? '');
$utm      = is_array($data['utm'] ?? null) ? $data['utm'] : [];

if (!$name || (!$email && strlen($whatsapp) < 4)) {
    http_response_code(400);
    echo json_encode(['error' => 'Name and at least one contact method required']);
    exit;
}

// ── Kommo credentials ──────────────────────────────────────────────────────
$token   = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjQyYTJlNjYxODA2MGNlZWNhNTIwMGU0ZmFlMzc3ODgyMWZlNDE4ZDEwYmY2M2U5NDhhMmZmMzBmODNkYmIwMmQ4NDJhNzhhMDE1NWVhMWRlIn0.eyJhdWQiOiI0M2RhOGRkYS1hNDdmLTRmNWItOTk3Ny04YTk3MTNkYzhkNGUiLCJqdGkiOiI0MmEyZTY2MTgwNjBjZWVjYTUyMDBlNGZhZTM3Nzg4MjFmZTQxOGQxMGJmNjNlOTQ4YTJmZjMwZjgzZGJiMDJkODQyYTc4YTAxNTVlYTFkZSIsImlhdCI6MTc1NDQ2Mzc1MiwibmJmIjoxNzU0NDYzNzUyLCJleHAiOjE4OTMzNjk2MDAsInN1YiI6IjgzNTY2MzEiLCJncmFudF90eXBlIjoiIiwiYWNjb3VudF9pZCI6MzAyMjY3NjMsImJhc2VfZG9tYWluIjoia29tbW8uY29tIiwidmVyc2lvbiI6Miwic2NvcGVzIjpbImNybSIsImZpbGVzIiwiZmlsZXNfZGVsZXRlIiwibm90aWZpY2F0aW9ucyIsInB1c2hfbm90aWZpY2F0aW9ucyJdLCJ1c2VyX2ZsYWdzIjowLCJoYXNoX3V1aWQiOiJhOTg3ZGFhOC1jOWJkLTQyNWQtYjA5Yi00YjVhNjI0MWQzMGEiLCJhcGlfZG9tYWluIjoiYXBpLWcua29tbW8uY29tIn0.AkYkZCdugdCCIxXuLPM5Ikm-LBozNrFn2yT75JRdthdCHZjM7BbhL07kyqnzE-vcReaelF4dtbLOlNlMUmY5h3Cpm37VYYmD2zrMhkhEO40_Yd-60arQH7tozM39ZKtgSS195Z4BMo5HGF5jHZJcYN8byplIovL5Zayct6-S4DNerbO5xk8drY47s--tIdqzkSH1QMIkRipcD5IrHo_8IsWdVG2ar3LydBJG-xYe50UHFO590493pEts40zh2Yxs1qRDfOu-0qI-BWl5Pof8ROyCgYXXHaTW0qyXodLxjsJGmkyexWtiTh38LwBaDASosxBdulc_lk7lP2iTPNO_tQ';
$baseUrl = 'https://baliboattours.kommo.com';
// ──────────────────────────────────────────────────────────────────────────

// Build contact fields
$customFields = [];

if ($whatsapp) {
    $customFields[] = [
        'field_code' => 'PHONE',
        'values'     => [['value' => $whatsapp, 'enum_code' => 'WORK']]
    ];
}

if ($email) {
    $customFields[] = [
        'field_code' => 'EMAIL',
        'values'     => [['value' => $email, 'enum_code' => 'WORK']]
    ];
}

// UTM → lead custom field IDs
$utmFieldMap = [
    'utm_content'  => 110692,
    'utm_medium'   => 110694,
    'utm_campaign' => 110696,
    'utm_source'   => 110698,
    'utm_term'     => 110700,
    'utm_referrer' => 110702,
];

$leadCustomFields = [];
foreach ($utmFieldMap as $utmKey => $fieldId) {
    if (!empty($utm[$utmKey])) {
        $leadCustomFields[] = [
            'field_id' => $fieldId,
            'values'   => [['value' => $utm[$utmKey]]],
        ];
    }
}

// POST /api/v4/leads/complex — creates lead + contact in one call
$payload = [[
    'name'   => 'Bluuu Marketing — ' . $name,
    'custom_fields_values' => $leadCustomFields ?: null,
    '_embedded' => [
        'contacts' => [[
            'name'                => $name,
            'custom_fields_values' => $customFields,
        ]]
    ]
]];


$ch = curl_init($baseUrl . '/api/v4/leads/complex');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($payload),
    CURLOPT_HTTPHEADER     => [
        'Authorization: Bearer ' . $token,
        'Content-Type: application/json',
    ],
    CURLOPT_TIMEOUT        => 30,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => false,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error    = curl_error($ch);
curl_close($ch);

if ($error) {
    http_response_code(502);
    echo json_encode(['error' => 'CRM connection error', 'detail' => $error]);
    exit;
}

if ($httpCode >= 200 && $httpCode < 300) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(502);
    echo json_encode(['error' => 'CRM error', 'status' => $httpCode, 'body' => json_decode($response)]);
}
