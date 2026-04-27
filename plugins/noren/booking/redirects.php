<?php

use Noren\Booking\Models\Tours;
use Noren\Booking\Models\Types;
use Noren\Bluuu\Models\Tourspage;
use Noren\Bluuu\Models\Blog;

// ── Sitemap & Robots ───────────────────────────────────────────────────────

Route::get('sitemap.xml', function () {
    return Response::view('noren.booking::sitemap', [
        'blog'  => Blog::get(),
        'pages' => Tourspage::where('id', '>', 1)->get(),
        'types' => Types::where('id', '<', 4)->get(),
        'tours' => Tours::with('types')->where('types_id', '<', 4)->get(),
    ])->header('Content-Type', 'text/xml');
});
Route::get('robots.txt', function () {
    return Response::view('noren.booking::robots')->header('Content-Type', 'text/plain');
});

// ── 301 Redirects ──────────────────────────────────────────────────────────

// /nusa-penida/*
Route::get('nusa-penida/shared-tours', function () {
    return redirect('/shared-tour-to-nusa-penida', 301);
});
Route::get('nusa-penida/shared-tours/{any}', function () {
    return redirect('/shared-tour-to-nusa-penida', 301);
})->where('any', '.*');

Route::get('nusa-penida/private-tours', function () {
    return redirect('/private-tour-to-nusa-penida', 301);
});
Route::get('nusa-penida/private-tours/{any}', function () {
    return redirect('/private-tour-to-nusa-penida', 301);
})->where('any', '.*');

Route::get('nusa-penida/bundeled-tours', function () {
    return redirect('/private-tour-to-nusa-penida', 301);
});
Route::get('nusa-penida/bundeled-tours/{any}', function () {
    return redirect('/private-tour-to-nusa-penida', 301);
})->where('any', '.*');

Route::get('nusa-penida/bundled-tours', function () {
    return redirect('/private-tour-to-nusa-penida', 301);
});
Route::get('nusa-penida/bundled-tours/{any}', function () {
    return redirect('/private-tour-to-nusa-penida', 301);
})->where('any', '.*');

Route::get('nusa-penida', function () {
    return redirect('/', 301);
});
Route::get('nusa-penida/{any}', function () {
    return redirect('/', 301);
})->where('any', '.*');

// /new/* — специфичные до общего
Route::get('new/private', function () {
    return redirect('/shared-tour-to-nusa-penida', 301);
});
Route::get('new/private/{any}', function () {
    return redirect('/shared-tour-to-nusa-penida', 301);
})->where('any', '.*');

Route::get('new/shared', function () {
    return redirect('/private-tour-to-nusa-penida', 301);
});
Route::get('new/shared/{any}', function () {
    return redirect('/private-tour-to-nusa-penida', 301);
})->where('any', '.*');

Route::get('new', function () {
    return redirect('/', 301);
});
Route::get('new/{path}', function ($path) {
    return redirect('/' . $path, 301);
})->where('path', '.*');

// /reviews/*
Route::get('reviews/{any}', function () {
    return redirect('/reviews', 301);
})->where('any', '.+');

// /information/*
Route::get('information/health', function () {
    return redirect('/policy/health', 301);
});
Route::get('information/privacy', function () {
    return redirect('/policy/privacy', 301);
});
Route::get('information/return', function () {
    return redirect('/policy/cancellation', 301);
});

Route::get('information/{any}', function () { abort(410); })->where('any', '.*');



