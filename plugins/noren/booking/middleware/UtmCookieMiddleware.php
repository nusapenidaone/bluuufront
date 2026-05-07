<?php namespace Noren\Booking\Middleware;

use Closure;
use Symfony\Component\HttpFoundation\Cookie;

class UtmCookieMiddleware
{
    public function handle($request, Closure $next)
    {
        $utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
        $utms = array_filter(array_intersect_key($request->query(), array_flip($utmKeys)));

        if (empty($utms)) {
            return $next($request);
        }

        $response = $next($request);

        $cookie = new Cookie(
            'bluuu_utm_pending',
            base64_encode(json_encode($utms)),
            time() + 300,
            '/',
            null,
            false,
            false,
            false,
            'lax'
        );
        $response->headers->setCookie($cookie);

        return $response;
    }
}
