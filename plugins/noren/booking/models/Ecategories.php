<?php namespace Noren\Booking\Models;

use Model;

/**
 * Model
 */
class Ecategories extends Model
{
    use \October\Rain\Database\Traits\Validation;
    use \October\Rain\Database\Traits\Sortable;

    /**
     * @var bool timestamps are disabled.
     * Remove this line if timestamps are defined in the database table.
     */
    public $timestamps = false;

    /**
     * @var string table in the database used by the model.
     */
    public $table = 'noren_booking_ecategories';

    /**
     * @var array rules for validation.
     */
    public $rules = [
    ];
    
    public $belongsToMany = [
        'extras' => [Extras::class, 'table' => 'noren_booking_ecategories_extras']
    ];


}
