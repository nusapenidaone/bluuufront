<?php namespace Noren\Booking\Models;

use Model;
use System\Models\File;

/**
 * Model
 */
class Transfer extends Model
{
    use \October\Rain\Database\Traits\Validation;

    /**
     * @var bool timestamps are disabled.
     * Remove this line if timestamps are defined in the database table.
     */
    public $timestamps = false;

    /**
     * @var string table in the database used by the model.
     */
    public $table = 'noren_booking_transfer';

    /**
     * @var array rules for validation.
     */
    public $rules = [
    ];

    protected $appends = ['image_url'];

    public $attachOne = [
        'image' => File::class,
    ];

    public function getImageUrlAttribute()
    {
        if (!$this->image) return null;
        return $this->image->getThumb(800, 500, [
            'mode' => 'crop',
            'extension' => 'webp',
        ]);
    }

}
