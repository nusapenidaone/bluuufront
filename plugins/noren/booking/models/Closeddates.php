<?php namespace Noren\Booking\Models;

use Model;

/**
 * Model
 */
class Closeddates extends Model
{
    use \October\Rain\Database\Traits\Validation;


    /**
     * @var string table in the database used by the model.
     */
    public $table = 'noren_booking_closeddates';

    /**
     * @var array rules for validation.
     */
    public $rules = [
    ];
    
    public $belongsTo =[
        'boat'=> Boat::class,
    ];
    protected $fillable = ['date','lead_id','boat_id','qtty', 'type'];

}
