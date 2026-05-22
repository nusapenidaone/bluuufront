<?php

use Noren\Booking\Ota\OtaController;

// ─── OTA Parser API ──────────────────────────────────────────────────────────
// Auth: Authorization: Bearer <OTA_API_KEY>  (set in .env)
//
// GET /api/ota/tours?source_id={n}
//   Returns all tours for an OTA source with route, restaurant, boats, pricing.
//   source_id matches noren_booking_source.id (e.g. 2 = Viator).
//
// GET /api/ota/tour/{id}/availability?date=YYYY-MM-DD&members={n}
//   Private: available_boats list.
//   Shared:  available_seats + assigned boat (first by sort_order that fits group).

Route::get('api/ota/tours',                  [OtaController::class, 'tours']);
Route::get('api/ota/tour/{id}/availability', [OtaController::class, 'availability']);
