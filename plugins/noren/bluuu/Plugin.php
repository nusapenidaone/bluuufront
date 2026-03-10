<?php namespace Noren\Bluuu;

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
    }

    /**
     * registerComponents used by the frontend.
     */
    public function registerComponents()
    {
        
        //return [
        //    \Noren\Bluuu\Components\Tourspage::class => 'tourspage'
        //];

    }

    /**
     * registerSettings used by the backend.
     */
    public function registerSettings()
    {
        
    return [
        'settings' => [
            'label' => 'Settings',
            'description' => 'Page Settings',
            'category' => 'Page Settings',
            'icon' => 'icon-gear',
            'class' => \Noren\Bluuu\Models\Settings::class,
            'permissions' => ['all']
        ],
        'rules' => [
            'label' => 'Rules',
            'description' => 'Rules',
            'category' => 'Page Settings',
            'icon' => 'icon-file',
            'class' => \Noren\Bluuu\Models\Rules::class,
            'permissions' => ['all']
        ],


        'banners' => [
            'label' => 'Banners',
            'description' => 'Popups',
            'category' => 'Page Settings',
            'icon' => 'icon-image',
            'class' => \Noren\Bluuu\Models\Banners::class,
            'permissions' => ['all']
        ],


        'registration' => [
            'label' => 'Registration',
            'description' => 'Registration',
            'category' => 'Page Settings',
            'icon' => 'icon-file',
            'class' => \Noren\Bluuu\Models\Registration::class,
            'permissions' => ['all']
        ],
    ];
        
    }
}
