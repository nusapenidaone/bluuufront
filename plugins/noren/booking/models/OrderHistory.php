<?php namespace Noren\Booking\Models;

use Model;

/**
 * Model
 */
class OrderHistory extends Model
{
    use \October\Rain\Database\Traits\Validation;


    /**
     * @var string table in the database used by the model.
     */
    public $table = 'noren_booking_order_history';

    /**
     * @var array rules for validation.
     */
    public $rules = [
    ];
    
    protected $jsonable = ['old_data','new_data'];
    protected $fillable = ['order_id','old_data','new_data'];
    
    
	public function getOldDataAttribute($value)
	{
	    if (is_array($value)) {
	        return json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
	    }
	
	    return $value;
	}

    
}
