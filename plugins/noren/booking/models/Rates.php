<?php namespace Noren\Booking\Models;

use Model;

/**
 * Model
 */
class Rates extends Model
{
    use \October\Rain\Database\Traits\Validation;
    use \October\Rain\Database\Traits\Revisionable;

    /**
     * @var string table in the database used by the model.
     */
    public $table = 'noren_booking_rates';

    /**
     * @var array rules for validation.
     */
    public $rules = [
    ];
    



    protected $revisionable = ['rate'];
    public $morphMany = [
        'revision_history' => [\System\Models\Revision::class, 'name' => 'revisionable']
    ];

}
