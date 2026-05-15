<?php namespace Noren\Booking\Controllers;

use Backend;
use BackendMenu;
use Backend\Classes\Controller;
use DB;

class Tours extends Controller
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
        BackendMenu::setContext('Noren.Booking', 'main-menu-item');
    }

    public function onRelationManageReorder()
    {
        \Log::info('onRelationManageReorder', [
            '_relation_field' => post('_relation_field'),
            'params'          => $this->params,
            'record_ids'      => post('record_ids'),
            'sort_orders'     => post('sort_orders'),
            'all_post'        => post(),
        ]);

        if (post('_relation_field') === 'boat') {
            $tourId  = $this->params[0] ?? null;
            $ids     = post('record_ids', []);
            $orders  = post('sort_orders', []);

            if ($tourId && $ids) {
                foreach ($ids as $index => $boatId) {
                    $sortOrder = isset($orders[$index]) ? (int) $orders[$index] : $index;
                    DB::table('noren_booking_tours_boat')
                        ->where('tours_id', $tourId)
                        ->where('boat_id', $boatId)
                        ->update(['sort_order' => $sortOrder]);
                }
            }

            return $this->asExtension('RelationController')->relationRefresh();
        }

        return $this->asExtension('RelationController')->onRelationManageReorder();
    }

}
