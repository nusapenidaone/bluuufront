<?php namespace Noren\Booking\Classes;

use Http;
use Log;

class KommoService
{
    // Фиксированный токен и домен Kommo
    protected static string $token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjQyYTJlNjYxODA2MGNlZWNhNTIwMGU0ZmFlMzc3ODgyMWZlNDE4ZDEwYmY2M2U5NDhhMmZmMzBmODNkYmIwMmQ4NDJhNzhhMDE1NWVhMWRlIn0.eyJhdWQiOiI0M2RhOGRkYS1hNDdmLTRmNWItOTk3Ny04YTk3MTNkYzhkNGUiLCJqdGkiOiI0MmEyZTY2MTgwNjBjZWVjYTUyMDBlNGZhZTM3Nzg4MjFmZTQxOGQxMGJmNjNlOTQ4YTJmZjMwZjgzZGJiMDJkODQyYTc4YTAxNTVlYTFkZSIsImlhdCI6MTc1NDQ2Mzc1MiwibmJmIjoxNzU0NDYzNzUyLCJleHAiOjE4OTMzNjk2MDAsInN1YiI6IjgzNTY2MzEiLCJncmFudF90eXBlIjoiIiwiYWNjb3VudF9pZCI6MzAyMjY3NjMsImJhc2VfZG9tYWluIjoia29tbW8uY29tIiwidmVyc2lvbiI6Miwic2NvcGVzIjpbImNybSIsImZpbGVzIiwiZmlsZXNfZGVsZXRlIiwibm90aWZpY2F0aW9ucyIsInB1c2hfbm90aWZpY2F0aW9ucyJdLCJ1c2VyX2ZsYWdzIjowLCJoYXNoX3V1aWQiOiJhOTg3ZGFhOC1jOWJkLTQyNWQtYjA5Yi00YjVhNjI0MWQzMGEiLCJhcGlfZG9tYWluIjoiYXBpLWcua29tbW8uY29tIn0.AkYkZCdugdCCIxXuLPM5Ikm-LBozNrFn2yT75JRdthdCHZjM7BbhL07kyqnzE-vcReaelF4dtbLOlNlMUmY5h3Cpm37VYYmD2zrMhkhEO40_Yd-60arQH7tozM39ZKtgSS195Z4BMo5HGF5jHZJcYN8byplIovL5Zayct6-S4DNerbO5xk8drY47s--tIdqzkSH1QMIkRipcD5IrHo_8IsWdVG2ar3LydBJG-xYe50UHFO590493pEts40zh2Yxs1qRDfOu-0qI-BWl5Pof8ROyCgYXXHaTW0qyXodLxjsJGmkyexWtiTh38LwBaDASosxBdulc_lk7lP2iTPNO_tQ';
    protected static string $baseUrl = 'https://baliboattours.kommo.com';

    //complex lead 
    public static function createComplexLead($leadData)
    {
        $url = self::$baseUrl . '/api/v4/leads/complex';

        $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . self::$token,
                'Accept'        => 'application/json',
            ])
            ->timeout(30) // увеличиваем таймаут
            ->retry(3, 200) // до 3 попыток с задержкой 200мс
            ->post($url, $leadData);
            
        

        if ($response->successful()) {
            return $response->json();
        }


        return [
            'status' => $response->status(),
            'body' => $response->body()
        ];
    }
    //update lead
    public static function updateLead($leadId, $leadData)
    {
        $url = self::$baseUrl . '/api/v4/leads/' . $leadId;

        $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . self::$token,
                'Accept'        => 'application/json',
            ])
             ->timeout(30) // увеличиваем таймаут
            ->retry(3, 200) // до 3 попыток с задержкой 200мс
            ->patch($url, $leadData);

        if ($response->successful()) {
            return $response->json();
        }

        return [
            'status' => $response->status(),
            'body'   => $response->body()
        ];
    }
    //update contact
    public static function updateContact($contactId, $contactData)
    {
        $url = self::$baseUrl . '/api/v4/contacts/' . $contactId;

        $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . self::$token,
                'Accept'        => 'application/json',
            ])
            ->timeout(30) // увеличиваем таймаут
            ->retry(3, 200) // до 3 попыток с задержкой 200мс
            ->patch($url, $contactData);

        if ($response->successful()) {
            return $response->json();
        }

        return [
            'status' => $response->status(),
            'body'   => $response->body()
        ];
    }
    //get lead
    public static function getLead(int $leadId)
    {
        $url = self::$baseUrl . '/api/v4/leads/' . $leadId.'?with=contacts';
    
        $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . self::$token,
                'Accept'        => 'application/json',
            ])
            ->timeout(30) // увеличиваем таймаут
            ->retry(3, 200) // до 3 попыток с задержкой 200мс
            ->get($url);
    
        if ($response->successful()) {
            return $response->json();
        }
    
        return [
            'status' => $response->status(),
            'body'   => $response->body()
        ];
    }
    
    //get contact
	public static function getContact(int $contactId)
	{
	    $url = self::$baseUrl . '/api/v4/contacts/' . $contactId;
	
	    $response = Http::withHeaders([
	            'Authorization' => 'Bearer ' . self::$token,
	            'Accept'        => 'application/json',
	        ])
            ->timeout(30) // увеличиваем таймаут
            ->retry(3, 200) // до 3 попыток с задержкой 200мс
	        ->get($url);
	
	    if ($response->successful()) {
	        return $response->json();
	    }
	
	    return [
	        'status' => $response->status(),
	        'body'   => $response->body()
	    ];
	}

    
    
	public static function sendNote($data)
	{
	    // Проверяем, что есть необходимые данные
	
	    $url = self::$baseUrl . '/api/v4/leads/notes';

	
	    $response = Http::withHeaders([
	            'Authorization' => 'Bearer ' . self::$token,
	            'Content-Type'  => 'application/json',
	            'Accept'        => 'application/json',
	        ])
            ->timeout(30) // увеличиваем таймаут
            ->retry(3, 200) // до 3 попыток с задержкой 200мс
	        ->post($url,$data);
	
	    if ($response->successful()) {
	        return $response->json();
	    }

	    return [
	        'status' => $response->status(),
	        'body'   => $response->body(),
	    ];
	}


    
    
}
