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
