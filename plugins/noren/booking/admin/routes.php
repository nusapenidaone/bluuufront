<?php

use Noren\Booking\Admin\AdminController;

// Admin API — protected by Bearer token (services.config.php → admin_token)

// ── Products (boats, tours, transfers, covers from local DB) ──────────────

Route::get('api/admin/boats',     [AdminController::class, 'boats']);
Route::get('api/admin/tours',     [AdminController::class, 'tours']);
Route::get('api/admin/transfers', [AdminController::class, 'transfers']);
Route::get('api/admin/covers',    [AdminController::class, 'covers']);

// ── Odoo-centric (primary) ─────────────────────────────────────────────────

// List sale.orders from Odoo with search/pagination
Route::get('api/admin/odoo/orders', [AdminController::class, 'odooOrders']);

// Get single Odoo order + linked local order (if any)
Route::get('api/admin/odoo/order/{odooId}', [AdminController::class, 'odooOrder']);

// Update Odoo fields directly (addresses, dates, passengers, deposit…)
Route::patch('api/admin/odoo/order/{odooId}', [AdminController::class, 'odooUpdate']);

// Cancel existing Odoo order + recreate from local order (for product changes)
Route::post('api/admin/odoo/order/{odooId}/recreate', [AdminController::class, 'odooRecreate']);

// Change boat/tour on local order + recreate Odoo order
Route::patch('api/admin/odoo/order/{odooId}/products', [AdminController::class, 'odooUpdateProducts']);

// ── Local DB helpers (secondary) ───────────────────────────────────────────

// List local orders
Route::get('api/admin/orders', [AdminController::class, 'index']);

// Get single local order + Odoo state
Route::get('api/admin/order/{id}', [AdminController::class, 'show']);

// Update local fields only (no hooks, no emails)
Route::patch('api/admin/order/{id}', [AdminController::class, 'update']);

// Push local order to Odoo (create if new, recreate if exists)
Route::post('api/admin/order/{id}/push', [AdminController::class, 'pushToOdoo']);
