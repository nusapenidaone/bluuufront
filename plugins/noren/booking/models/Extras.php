<?php
namespace Noren\Booking\Models;

use Model;
use System\Models\File;
/**
 * Model
 */
class Extras extends Model
{
    use \October\Rain\Database\Traits\Validation;
    use \October\Rain\Database\Traits\Sortable;


    /**
     * @var string table in the database used by the model.
     */
    public $table = 'noren_booking_extras';

    /**
     * @var array rules for validation.
     */
    public $rules = [
    ];

    public $belongsTo = [
        'parent' => [Extras::class, 'key' => 'parent_id'],
    ];

    public $hasMany = [
        'children' => [Extras::class, 'key' => 'parent_id'],
    ];

    public $belongsToMany = [
        'ecategories' => [Ecategories::class, 'table' => 'noren_booking_ecategories_extras']
    ];


    public function scopeFilterByEcategory($query, $value)
    {
        return $query->whereHas('ecategories', function ($q) use ($value) {
            $q->whereIn('id', (array) $value);
        });
    }


    protected $appends = ['images_with_thumbs'];

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
                'original' => $image->getPath(),
                'thumb' => $image->getThumb(400, 400, [
                    'mode' => 'crop',
                    'extension' => 'webp',
                ]),
                'thumb1' => $image->getThumb(600, 400, [
                    'mode' => 'crop',
                    'extension' => 'webp',
                ]),
            ];
        })->toArray();
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
