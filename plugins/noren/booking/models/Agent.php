<?php namespace Noren\Booking\Models;

use Model;

/**
 * Model
 */
class Agent extends Model
{
    use \October\Rain\Database\Traits\Validation;

    /**
     * @var bool timestamps are disabled.
     * Remove this line if timestamps are defined in the database table.
     */
    public $timestamps = false;

    /**
     * @var string table in the database used by the model.
     */
    public $table = 'noren_booking_agent';

    /**
     * @var array rules for validation.
     */
    public $rules = [
    ];
    public $hasMany = [
        'promocode' => Promocode::class,
    ];

}
