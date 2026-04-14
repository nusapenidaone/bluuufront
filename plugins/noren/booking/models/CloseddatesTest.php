<?php namespace Noren\Booking\Models;

use Model;

class CloseddatesTest extends Model
{
    use \October\Rain\Database\Traits\Validation;

    public $table = 'noren_booking_closeddates_test';

    public $rules = [];

    public $belongsTo = [
        'boat' => Boat::class,
    ];

    protected $fillable = ['date', 'lead_id', 'boat_id', 'qtty', 'type', 'odoo_id'];
}
