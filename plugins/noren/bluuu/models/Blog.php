<?php namespace Noren\Bluuu\Models;

use Model;

/**
 * Model
 */
class Blog extends Model
{
    use \October\Rain\Database\Traits\Validation;


    /**
     * @var string table in the database used by the model.
     */
    public $table = 'noren_bluuu_blog';

    /**
     * @var array rules for validation.
     */
    public $rules = [
    ];
    
    public $attachMany = [
        'images' => \System\Models\File::class
    ];
    
    
    
    public $belongsToMany = [
        'tours' => [\Noren\Booking\Models\Tours::class, 'table' => 'noren_bluuu_blog_tours'],
    ];

}
