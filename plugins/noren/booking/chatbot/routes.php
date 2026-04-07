<?php

use Noren\Booking\Chatbot\ChatbotController;
use Noren\Booking\Chatbot\ChatbotControllerV2;

// Chatbot v1 (API key required)
Route::get('api/chatbot/boats/private', [ChatbotController::class, 'getPrivateBoats']);
Route::get('api/chatbot/boats/shared',  [ChatbotController::class, 'getSharedBoats']);
Route::post('api/chatbot/quote',        [ChatbotController::class, 'getQuote']);

// Chatbot v2 — includes odoo_id on all entities
Route::get('api/v2/chatbot/boats/private', [ChatbotControllerV2::class, 'getPrivateBoats']);
Route::get('api/v2/chatbot/boats/shared',  [ChatbotControllerV2::class, 'getSharedBoats']);
Route::post('api/v2/chatbot/quote',        [ChatbotControllerV2::class, 'getQuote']);
