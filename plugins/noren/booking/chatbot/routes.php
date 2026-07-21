<?php

use Noren\Booking\Chatbot\ChatbotControllerV2;

// Chatbot API — includes odoo_id on all entities
Route::get('api/v2/chatbot/boats/private', [ChatbotControllerV2::class, 'getPrivateBoats']);
Route::get('api/v2/chatbot/boats/shared',  [ChatbotControllerV2::class, 'getSharedBoats']);
Route::post('api/v2/chatbot/quote',        [ChatbotControllerV2::class, 'getQuote']);
Route::get('api/v2/chatbot/availability',  [ChatbotControllerV2::class, 'getAvailability']);
