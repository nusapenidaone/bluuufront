<?php namespace Noren\Booking\Models;

use Model;
use System\Models\File;
/**
 * Model
 */
class Overview extends Model
{
    use \October\Rain\Database\Traits\Validation;
    use \October\Rain\Database\Traits\Sortable;

    /**
     * @var bool timestamps are disabled.
     * Remove this line if timestamps are defined in the database table.
     */
    public $timestamps = false;

    /**
     * @var string table in the database used by the model.
     */
    public $table = 'noren_booking_overview';

    /**
     * @var array rules for validation.
     */
    public $rules = [];
    
    protected $jsonable=['list'];
    
    public $attachOne = [
        'img' => File::class,
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
                'original'    => $image->getPath(),
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

    /**
     * ✅ Удаляем миниатюры при удалении лодки
     */
    public function beforeDelete()
    {
        foreach ($this->images as $image) {
            $this->deleteThumbsFor($image);
        }
    }

    /**
     * 🧹 Удалить все миниатюры для одного файла
     */
    protected function deleteThumbsFor(File $file)
    {
        $path = storage_path('app/uploads/public/' . $file->getPartitionDirectory());

        $pattern = $path . '/thumb_' . $file->id . '_*';

        foreach (glob($pattern) as $thumbPath) {
            @unlink($thumbPath);
        }
    }
}
