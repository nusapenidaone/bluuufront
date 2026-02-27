<?php namespace Noren\Booking\Models;

use Model;

/**
 * Model
 */
class Promocode extends Model
{
    use \October\Rain\Database\Traits\Validation;


    /**
     * @var string table in the database used by the model.
     */
    public $table = 'noren_booking_promocode';

    /**
     * @var array rules for validation.
     */
    public $rules = [
    ];
    
    public $belongsTo = [
        'agent' => Agent::class,
    ];
    
    
    public $belongsToMany = [
        'tours' => [Tours::class, 'table' => 'noren_booking_promocode_tours'],

    ];

}
