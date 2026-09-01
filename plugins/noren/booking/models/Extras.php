<?php namespace Noren\Booking\Models;

use Model;
use System\Models\File;
/**
 * Model
 */
class Extras extends Model
{
    use \October\Rain\Database\Traits\Validation;
    use \October\Rain\Database\Traits\Sortable;
    use \October\Rain\Database\Traits\SimpleTree;

    /**
     * @var string table in the database used by the model.
     */
    public $table = 'noren_booking_extras';

    /**
     * @var array rules for validation.
     */
    public $rules = [
    ];
    
    public $belongsToMany = [
        'ecategories' => [Ecategories::class, 'table' => 'noren_booking_ecategories_extras'],
        'conflicts' => [
            Extras::class,
            'table' => 'noren_booking_extras_conflicts',
            'key' => 'extras_id',
            'otherKey' => 'conflict_extras_id',
        ],
    ];


    public function scopeFilterByEcategory($query, $value)
    {
        return $query->whereHas('ecategories', function ($q) use ($value) {
            $q->whereIn('id', (array) $value);
        });
    }


    protected $appends = ['images_with_thumbs', 'conflict_ids'];

    protected $hidden = ['images'];

    public $attachMany = [
        'images' => File::class,
    ];


    public function getImagesWithThumbsAttribute()
    {
        if (!$this->images) {
            return [];
        }

        return $this->images->map(function ($image) {
            return [
                'original'    => $image->getPath(),
                'thumb'       => $image->getThumb(400, 400, ['mode' => 'crop', 'extension' => 'webp', 'quality' => 80]),
                'thumb_small' => $image->getThumb(200, 200, ['mode' => 'crop', 'extension' => 'webp', 'quality' => 75]),
            ];
        })->toArray();
    }

    public function getConflictIdsAttribute()
    {
        $direct = $this->conflicts->pluck('id')->toArray();
        $reverse = self::whereHas('conflicts', function ($q) {
            $q->where('noren_booking_extras.id', $this->id);
        })->pluck('id')->toArray();

        return array_values(array_unique(array_merge($direct, $reverse)));
    }



public function beforeDelete()
{
    foreach ($this->images as $image) {
        $this->deleteThumbsFor($image);
    }
}

protected function deleteThumbsFor(File $file)
{
    $path = dirname($file->getLocalPath()); // путь к директории файла
    $pattern = $path . '/thumb_' . $file->id . '_*';

    foreach (glob($pattern) as $thumbPath) {
        @unlink($thumbPath);
    }
}




}
