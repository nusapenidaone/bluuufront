<?php namespace Noren\Booking\Models;

use Model;
use System\Models\File;

/**
 * Model
 */
class Packages extends Model
{
    use \October\Rain\Database\Traits\Validation;


    /**
     * @var string table in the database used by the model.
     */
    public $table = 'noren_booking_packages';

    /**
     * @var array rules for validation.
     */
    public $rules = [
    ];
    //public $hasMany = [
    //    'packagesitems' => PackagesItems::class
    //];
    protected $jsonable = ['pricelist'];
    
    

}
