<?php namespace Noren\Bluuu\Models;

use Model;

/**
 * Model
 */
class Gallery extends Model
{
    use \October\Rain\Database\Traits\Validation;


    /**
     * @var string table in the database used by the model.
     */
    public $table = 'noren_bluuu_gallery';

    /**
     * @var array rules for validation.
     */
    public $rules = [
    ];
    
    public $attachMany = [
        'images' => \System\Models\File::class
    ];

}
