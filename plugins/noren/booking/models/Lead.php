<?php namespace Noren\Booking\Models;

use Model;

/**
 * Model
 */
class Lead extends Model
{
    use \October\Rain\Database\Traits\Validation;


    /**
     * @var string table in the database used by the model.
     */
    public $table = 'noren_booking_lead';

    /**
     * @var array rules for validation.
     */
    public $rules = [
    ];
    protected $jsonable = ['body'];
    public $belongsTo =[
        'order'=> Order::class,
    ];
}
