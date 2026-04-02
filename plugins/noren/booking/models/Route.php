<?php
namespace Noren\Booking\Models;

use Model;

/**
 * Model
 */
class Route extends Model
{
    use \October\Rain\Database\Traits\Validation;
    use \October\Rain\Database\Traits\Sortable;

    /**
     * @var string table in the database used by the model.
     */
    public $table = 'noren_booking_route';

    /**
     * @var array rules for validation.
     */
    public $rules = [
    ];
    public $belongsToMany = [
        'ecategories' => [Ecategories::class, 'table' => 'noren_booking_route_ecategories'],
    ];

    public $belongsTo = [
        'restaurant' => [Restaurant::class],
        'classes' => [Classes::class],
        'program' => [Program::class],
    ];

    public $jsonable = [
        'highlights',
        'schedule_before_lunch',
        'schedule_after_lunch',
    ];

    public $attachMany = [
        'photos' => [\System\Models\File::class],
    ];
    public $attachOne = [
        'map' => [\System\Models\File::class],
    ];
}
