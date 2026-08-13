<?php namespace Noren\Booking\Models;

use Model;

class CloseddatesTest extends Model
{
    use \October\Rain\Database\Traits\Validation;
    use \October\Rain\Database\Traits\Revisionable;

    public $table = 'noren_booking_closeddates_test';

    public $rules = [];

    protected $revisionable = ['date', 'boat_id', 'qtty', 'type', 'odoo_id', 'tour_type'];

    public $morphMany = [
        'revision_history' => [\System\Models\Revision::class, 'name' => 'revisionable'],
    ];

    public $belongsTo = [
        'boat' => Boat::class,
    ];

    protected $fillable = ['date', 'lead_id', 'boat_id', 'qtty', 'type', 'odoo_id', 'tour_type'];




}
