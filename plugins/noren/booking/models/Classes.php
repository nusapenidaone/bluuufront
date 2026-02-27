<?php namespace Noren\Booking\Models;

use Model;

/**
 * Model
 */
class Classes extends Model
{
    use \October\Rain\Database\Traits\Validation;


    /**
     * @var string table in the database used by the model.
     */
    public $table = 'noren_booking_classes';

    /**
     * @var array rules for validation.
     */
    public $rules = [
    ];
    
    public $belongsTo = [
        'types' => Types::class,
    ];

}
