<?php namespace Noren\Booking\Models;

use Model;

/**
 * Low season — процентная скидка на выбранные туры в интервале дат.
 * Действует только на цену тура (+ boat_price для private); transfer, cover и extras не дисконтируются.
 * Если на одну дату/тур попадает несколько активных правил — берётся максимальный percent.
 */
class LowSeason extends Model
{
    use \October\Rain\Database\Traits\Validation;

    /**
     * @var string table in the database used by the model.
     */
    public $table = 'noren_booking_lowseason';

    protected $fillable = ['name', 'date_start', 'date_end', 'percent', 'is_active'];

    /**
     * @var array rules for validation.
     */
    public $rules = [
        'name'       => 'required',
        'date_start' => 'required|date',
        'date_end'   => 'required|date|after_or_equal:date_start',
        'percent'    => 'required|integer|between:1,90',
    ];

    public $customMessages = [
        'date_end.after_or_equal' => 'Date end must be on or after date start.',
        'percent.between'         => 'Discount must be between 1 and 90 %.',
    ];

    public $belongsToMany = [
        'tours' => [
            Tours::class,
            'table'    => 'noren_booking_lowseason_tours',
            'key'      => 'lowseason_id',
            'otherKey' => 'tours_id',
        ],
    ];

    /**
     * Активные правила, покрывающие дату (Y-m-d).
     */
    public function scopeActiveOn($query, $date)
    {
        $date = substr((string) $date, 0, 10);

        return $query->where('is_active', 1)
            ->where('date_start', '<=', $date)
            ->where('date_end', '>=', $date);
    }

    /**
     * Активные правила, которые ещё не закончились (date_end >= $date, по умолчанию сегодня).
     */
    public function scopeUpcoming($query, $date = null)
    {
        $date = $date ? substr((string) $date, 0, 10) : date('Y-m-d');

        return $query->where('is_active', 1)
            ->where('date_end', '>=', $date);
    }
}
