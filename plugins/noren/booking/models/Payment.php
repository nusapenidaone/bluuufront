<?php namespace Noren\Booking\Models;

use Model;

/**
 * Model
 */
class Payment extends Model
{
    use \October\Rain\Database\Traits\Validation;


    /**
     * @var string table in the database used by the model.
     */
    public $table = 'noren_booking_payment';
    protected $fillable = ['body', 'method', 'status'];
    protected $jsonable = ['body'];
    /**
     * @var array rules for validation.
     */
    public $rules = [
    ];
    
    public $belongsTo =[
        'order'=> Order::class,
    ];
}
