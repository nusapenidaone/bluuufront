<?php namespace Noren\Bluuu\Models;

use Model;
use System\Models\File;
/**
 * Model
 */
class Promoslider extends Model
{
    use \October\Rain\Database\Traits\Validation;
    use \October\Rain\Database\Traits\Sortable;

    /**
     * @var string table in the database used by the model.
     */
    public $table = 'noren_bluuu_promoslider';
    
    /**
     * @var array rules for validation.
     */
    public $rules = [
    ];
  
    
    protected $appends = ['images_with_thumbs'];

    protected $hidden = ['img'];

    public $attachMany = [
        'img' => File::class,
    ];


    public function getImagesWithThumbsAttribute()
    {
        if (!$this->img) {
            return [];
        }

        return $this->img->map(function ($image) {
            return [

                'large' => $image->getThumb(1300, 730, [
                    'mode' => 'crop',
                    'extension' => 'webp',
                ]),
                'small' => $image->getThumb(800, 1066, [
                    'mode' => 'crop',
                    'extension' => 'webp',
                ]),
            ];
        })->toArray();
    }



public function beforeDelete()
{
    foreach ($this->img as $image) {
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
