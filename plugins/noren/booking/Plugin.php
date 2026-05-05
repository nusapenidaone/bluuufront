<?php namespace Noren\Booking;

use System\Classes\PluginBase;

/**
 * Plugin class
 */
class Plugin extends PluginBase
{
    /**
     * register method, called when the plugin is first registered.
     */
    public function register()
    {
    }

    /**
     * boot method, called right before the request route.
     */
    public function boot()
    {
        \App::middleware(function ($request, \Closure $next) {
            $utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
            $utms = array_filter(array_intersect_key($request->query(), array_flip($utmKeys)));

            if (empty($utms)) {
                return $next($request);
            }

            $response = $next($request);

            $cookie = new \Symfony\Component\HttpFoundation\Cookie(
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
        });
    }

    /**
     * registerComponents used by the frontend.
     */
    public function registerComponents()
    {
    }
    
public function registerFormWidgets()
{
    return [
        \Noren\Booking\FormWidgets\PackageItemsEditor::class => [
            'label' => 'Package Items Editor',
            'code'  => 'packageitemseditor'
        ]
    ];
}


    /**
     * registerSettings used by the backend.
     */
    public function registerSettings()
    {
        
    //return [
    //    'settings' => [
    //        'label' => 'Settings',
    //        'description' => 'Booking Settings',
    //        'category' => 'Booking Settings',
    //        'icon' => 'icon-gear',
    //        'class' => \Noren\Booking\Models\Settings::class,
    //        'permissions' => ['admin']
    //    ],
//
//
    //];
        
    }
}
