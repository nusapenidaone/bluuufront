<?php namespace Noren\Booking\Controllers;

use Backend;
use BackendMenu;
use Backend\Classes\Controller;
use Noren\Booking\Models\Packages as Pack;

class Packages extends Controller
{
    public $implement = [
        \Backend\Behaviors\FormController::class,
        \Backend\Behaviors\ListController::class,
        \Backend\Behaviors\RelationController::class
    ];

    public $formConfig = 'config_form.yaml';
    public $listConfig = 'config_list.yaml';
    public $relationConfig = 'config_relation.yaml';

    public function __construct()
    {
        parent::__construct();
        BackendMenu::setContext('Noren.Booking', 'main-menu-item', 'side-menu-item4');
    }
    
    
    public function onDuplicate() { 
        $checked_items_ids = input('checked'); 
        foreach ($checked_items_ids as $id) {
            $original = PAck::where("id", $id)->first(); 
            $clone = $original->replicate(); 
            $clone->save(); 

        }

        return $this->listRefresh(); 
    }
    

}
