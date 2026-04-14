<?php namespace Noren\Booking\Models;

use Model;
use System\Models\File;
/**
 * Model
 */
class Program extends Model
{
    use \October\Rain\Database\Traits\Validation;
    use \October\Rain\Database\Traits\Sortable;

    /**
     * @var string table in the database used by the model.
     */
    public $table = 'noren_booking_program';
    protected $jsonable = ['list'];
    /**
     * @var array rules for validation.
     */
    public $rules = [];

    public $belongsToMany = [
        'restaurant' => [Restaurant::class, 'table' => 'noren_booking_program_restaurant'],
    ];
    



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
                'thumb'       => $image->getThumb(400, 400, ['mode' => 'crop', 'extension' => 'webp', 'quality' => 80]),
                'thumb_small' => $image->getThumb(200, 200, ['mode' => 'crop', 'extension' => 'webp', 'quality' => 75]),
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
