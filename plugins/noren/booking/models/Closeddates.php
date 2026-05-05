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
    protected $fillable = ['date','lead_id','boat_id','qtty', 'type', 'odoo_id'];

    public function scopeFilterType($query, $scope)
    {
        $values = is_object($scope) ? $scope->value : $scope;
        if (!$values) return $query;

        return $query->where(function($q) use ($values) {
            foreach ($values as $value) {
                if ($value === 'empty') {
                    $q->orWhereNull('type')->orWhere('type', '');
                } else {
                    $q->orWhere('type', $value);
                }
            }
        });
    }

}
