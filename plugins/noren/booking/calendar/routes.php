<?php

use Noren\Booking\Calendar\CalendarController;

Route::get('api/new/calendar/data',        [CalendarController::class, 'getData']);
Route::post('api/new/calendar/create',      [CalendarController::class, 'create']);
Route::post('api/new/calendar/update/{id}', [CalendarController::class, 'update']);
Route::post('api/new/calendar/delete/{id}', [CalendarController::class, 'delete']);
Route::options('api/new/calendar/{any}',    [CalendarController::class, 'options'])->where('any', '.*');
