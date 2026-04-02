<?php namespace Noren\Booking\Models;

use Model;

/**
 * Model
 */
class Boat extends Model
{
    use \October\Rain\Database\Traits\Validation;
    use \October\Rain\Database\Traits\Sortable;

    /**
     * @var string table in the database used by the model.
     */
    public $table = 'noren_booking_boat';
    //protected $fillable = ['id','name','amo_name','capacity'];
    /**
     * @var array rules for validation.
     */
    public $rules = [
    ];
    public $hasMany =[
        'closeddates'=> Closeddates::class,
    ];
    
    
    public $belongsTo = [
        'company' => [Company::class],
    ];


}
