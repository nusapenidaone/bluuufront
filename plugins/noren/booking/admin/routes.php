<?php

use Noren\Booking\Admin\AdminController;

// Admin API — protected by Bearer token (services.config.php → admin_token)

// ── Auth ──────────────────────────────────────────────────────────────────
Route::post('api/admin/login',    [AdminController::class, 'login']);
Route::get('api/admin/managers',  [AdminController::class, 'managers']);

// ── Products (boats, tours, transfers, covers from local DB) ──────────────

Route::get('api/admin/boats',     [AdminController::class, 'boats']);
Route::get('api/admin/tours',     [AdminController::class, 'tours']);
Route::get('api/admin/transfers', [AdminController::class, 'transfers']);
Route::get('api/admin/covers',    [AdminController::class, 'covers']);
Route::get('api/admin/extras',    [AdminController::class, 'extras']);

// ── Odoo-centric (primary) ─────────────────────────────────────────────────

// Daily leads table — Odoo orders by date (Bali tz), enriched with local data
Route::get('api/admin/leads', [AdminController::class, 'leads']);

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

// Change extras on local order + recreate Odoo order
Route::patch('api/admin/odoo/order/{odooId}/extras', [AdminController::class, 'odooUpdateExtras']);

// ── Local DB helpers (secondary) ───────────────────────────────────────────

// List local orders
Route::get('api/admin/orders', [AdminController::class, 'index']);

// Get single local order + Odoo state
Route::get('api/admin/order/{id}', [AdminController::class, 'show']);

// Update local fields only (no hooks, no emails)
Route::patch('api/admin/order/{id}', [AdminController::class, 'update']);

// Push local order to Odoo (create if new, recreate if exists)
Route::post('api/admin/order/{id}/push', [AdminController::class, 'pushToOdoo']);

// ── Blog ────────────────────────────────────────────────────────────────────────
// NOTE: static segments (authors) must be declared BEFORE wildcard {id} routes

Route::get('api/admin/blog',                        [AdminController::class, 'blogList']);
Route::post('api/admin/blog',                       [AdminController::class, 'blogCreate']);

// Authors — declared before blog/{id} so Laravel doesn't swallow 'authors' as {id}
Route::get('api/admin/blog/authors',                [AdminController::class, 'authorList']);
Route::post('api/admin/blog/authors',               [AdminController::class, 'authorCreate']);
Route::get('api/admin/blog/authors/{id}',           [AdminController::class, 'authorGet']);
Route::patch('api/admin/blog/authors/{id}',         [AdminController::class, 'authorUpdate']);
Route::delete('api/admin/blog/authors/{id}',        [AdminController::class, 'authorDelete']);

// Blog by ID — after static segments
Route::get('api/admin/blog/{id}',                   [AdminController::class, 'blogGet']);
Route::patch('api/admin/blog/{id}',                 [AdminController::class, 'blogUpdate']);
Route::delete('api/admin/blog/{id}',                [AdminController::class, 'blogDelete']);
