<?php

use Noren\Booking\Models\Tours;
use Noren\Booking\Models\Types;
use Noren\Bluuu\Models\Tourspage;
use Noren\Bluuu\Models\Blog;

if (!function_exists('redirectWithQuery')) {
    function redirectWithQuery(string $to, int $status = 301)
    {
        $qs = request()->getQueryString();
        if ($qs) {
            parse_str($qs, $parsed);
            $utms = array_intersect_key($parsed, array_flip(
                ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
            ));
            if (!empty($utms)) {
                setrawcookie('bluuu_utm_pending', base64_encode(json_encode($utms)), [
                    'expires'  => time() + 300,
                    'path'     => '/',
                    'httponly' => false,
                    'samesite' => 'Lax',
                ]);
            }
            return redirect("$to?$qs", $status);
        }
        return redirect($to, $status);
    }
}

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
    return redirectWithQuery('/shared-tour-to-nusa-penida');
});
Route::get('nusa-penida/shared-tours/{any}', function () {
    return redirectWithQuery('/shared-tour-to-nusa-penida');
})->where('any', '.*');

Route::get('nusa-penida/private-tours', function () {
    return redirectWithQuery('/private-tour-to-nusa-penida');
});
Route::get('nusa-penida/private-tours/{any}', function () {
    return redirectWithQuery('/private-tour-to-nusa-penida');
})->where('any', '.*');

Route::get('nusa-penida/bundeled-tours', function () {
    return redirectWithQuery('/private-tour-to-nusa-penida');
});
Route::get('nusa-penida/bundeled-tours/{any}', function () {
    return redirectWithQuery('/private-tour-to-nusa-penida');
})->where('any', '.*');

Route::get('nusa-penida/bundled-tours', function () {
    return redirectWithQuery('/private-tour-to-nusa-penida');
});
Route::get('nusa-penida/bundled-tours/{any}', function () {
    return redirectWithQuery('/private-tour-to-nusa-penida');
})->where('any', '.*');

Route::get('nusa-penida', function () {
    return redirectWithQuery('/');
});

Route::get('nusa-penida/{any}', function () {
    return redirectWithQuery('/');
})->where('any', '.*');

// /new/* — специфичные до общего
Route::get('new/private', function () {
    return redirectWithQuery('/shared-tour-to-nusa-penida');
});
Route::get('new/private/{any}', function () {
    return redirectWithQuery('/shared-tour-to-nusa-penida');
})->where('any', '.*');

Route::get('new/shared', function () {
    return redirectWithQuery('/private-tour-to-nusa-penida');
});
Route::get('new/shared/{any}', function () {
    return redirectWithQuery('/private-tour-to-nusa-penida');
})->where('any', '.*');

Route::get('new', function () {
    return redirectWithQuery('/');
});
Route::get('new/{path}', function ($path) {
    return redirectWithQuery('/' . $path);
})->where('path', '.*');

// /reviews/*
Route::get('reviews/{any}', function () {
    return redirectWithQuery('/reviews');
})->where('any', '.+');

// /information/*
Route::get('information/health', function () {
    return redirectWithQuery('/policy/health');
});
Route::get('information/privacy', function () {
    return redirectWithQuery('/policy/privacy');
});
Route::get('information/return', function () {
    return redirectWithQuery('/policy/cancellation');
});

Route::get('information/{any}', function () { abort(410); })->where('any', '.*');
