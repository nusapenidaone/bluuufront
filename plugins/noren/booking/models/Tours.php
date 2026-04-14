<?php namespace Noren\Booking\Models;

use Model;
use System\Models\File;
/**
 * Model
 */
class Tours extends Model
{
    use \October\Rain\Database\Traits\Validation;
    use \October\Rain\Database\Traits\Sortable;

    /**
     * @var string table in the database used by the model.
     */
    public $table = 'noren_booking_tours';

    /**
     * @var array rules for validation.
     */
    public $rules = [
    ];
    protected $jsonable = ['props', 'list', 'json'];
    
    public $belongsTo = [
        'types' => Types::class,
        'classes' => Classes::class,
        'packages' => Packages::class,
        'badge' => Badge::class,
        'cancelation' => Cancelation::class,
        'meeting' => Meeting::class,
        'additional' => Additional::class,
        'route'=> Route::class,

    ];
    public $hasMany = [
        'pricesbydates' => PricesByDates::class,
        //'props' => Props::class
    ];
    
    public $belongsToMany = [
        'ecategories' => [Ecategories::class, 'table' => 'noren_booking_tours_ecategories'],
        'transfer' => [Transfer::class, 'table' => 'noren_booking_tours_transfer'],
        'cover' => [Cover::class, 'table' => 'noren_booking_tours_cover'],
        'program' => [Program::class, 'table' => 'noren_booking_tours_program'],
        'overview' => [Overview::class, 'table' => 'noren_booking_tours_overview'],
        'includes' => [Includes::class, 'table' => 'noren_booking_tours_includes'],
        'included' => [Included::class, 'table' => 'noren_booking_tours_included'],
        'why' => [Why::class, 'table' => 'noren_booking_tours_why'],
        'restaurant' => [Restaurant::class, 'table' => 'noren_booking_tours_restaurant'],
        'boat' => [Boat::class, 'table' => 'noren_booking_tours_boat'],
        'category' => [Category::class, 'table' => 'noren_booking_tours_category'],
        
        'similar' => [
            Tours::class,
            'table'    => 'noren_booking_tours_similar',
            'key'      => 'similar_tours_id',
        ],
        
        
        'reviews' => [\Noren\Bluuu\Models\Reviews::class, 'table' => 'noren_booking_tours_reviews'],
        'faq' => [\Noren\Bluuu\Models\Faq::class, 'table' => 'noren_booking_tours_faq'],
        
    ];
    
    
	public function scopeFilterByCategory($query, $value)
	{
	    return $query->whereHas('category', function($q) use ($value) {
	        $q->whereIn('id', (array) $value);
	    });
	}

    
    
    public $attachOne = [
        'memo' => File::class,
    ];
    public $attachMany = [
        'images' => File::class,
    ];
    protected $appends = ['images_with_thumbs'];
    protected $hidden = ['images'];

    /**
     *Возвращает массив миниатюр и оригиналов
     */
    public function getImagesWithThumbsAttribute()
    {
        if (!$this->images) {
            return [];
        }

        return $this->images->map(function ($image) {
            return [
                'original'    => $image->getPath(),
                'thumb1'      => $image->getThumb(600, 400, ['mode' => 'crop', 'extension' => 'webp', 'quality' => 80]),
                'thumb1_small'=> $image->getThumb(300, 200, ['mode' => 'crop', 'extension' => 'webp', 'quality' => 75]),
                'thumb2'      => $image->getThumb(900, 600, ['mode' => 'crop', 'extension' => 'webp', 'quality' => 80]),
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
