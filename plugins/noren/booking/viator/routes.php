<?php

use Noren\Booking\Viator\ViatorController;

// ─── Viator Supplier API (Operator-Hosted) ───────────────────────────────────
// All endpoints require header:  X-API-Key: <VIATOR_API_KEY>
// Set in .env: VIATOR_API_KEY=... and VIATOR_SUPPLIER_ID=...

// v1.0 — Tour List (product/option inventory mapping)
Route::post('viator/tourlist', [ViatorController::class, 'tourList']);

// v2.0 — Availability
Route::post('viator/v2/availability/check',    [ViatorController::class, 'availabilityCheck']);
Route::post('viator/v2/availability/calendar', [ViatorController::class, 'availabilityCalendar']);

// v2.0 — Reservation & Booking
Route::post('viator/v2/reserve',              [ViatorController::class, 'reserve']);
Route::post('viator/v2/booking',              [ViatorController::class, 'booking']);
Route::post('viator/v2/booking-amendment',    [ViatorController::class, 'bookingAmendment']);
Route::post('viator/v2/booking-cancellation', [ViatorController::class, 'bookingCancellation']);

// v2.0 — Redemption
Route::post('viator/v2/redemption',           [ViatorController::class, 'redemption']);
