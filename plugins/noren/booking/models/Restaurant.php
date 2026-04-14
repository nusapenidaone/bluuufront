<?php namespace Noren\Booking\Models;

use Model;
use System\Models\File;
/**
 * Model
 */
class Restaurant extends Model
{
    use \October\Rain\Database\Traits\Validation;
    use \October\Rain\Database\Traits\Sortable;

    /**
     * @var string table in the database used by the model.
     */
    public $table = 'noren_booking_restaurant';

    /**
     * @var array rules for validation.
     */
    public $rules = [
    ];
    protected $appends = ['images_with_thumbs'];

    protected $hidden = ['images'];

    public $attachMany = [
        'images' => File::class,
    ];

    /**
     * ✅ Возвращает массив миниатюр и оригиналов
     */
    public function getImagesWithThumbsAttribute()
    {
        if (!$this->images) {
            return [];
        }

        return $this->images->map(function ($image) {
            return [
                'thumb'       => $image->getThumb(400, 400, ['mode' => 'crop', 'extension' => 'webp', 'quality' => 80]),
                'thumb_small' => $image->getThumb(200, 200, ['mode' => 'crop', 'extension' => 'webp', 'quality' => 75]),
            ];
        })->toArray();
    }

    /**
     * ✅ Прогреваем миниатюры после сохранения
     */
    public function afterSave()
    {
        foreach ($this->images as $image) {
            $image->getThumb(400, 400, ['mode' => 'crop', 'extension' => 'webp', 'quality' => 80]);
            $image->getThumb(200, 200, ['mode' => 'crop', 'extension' => 'webp', 'quality' => 75]);
        }
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
