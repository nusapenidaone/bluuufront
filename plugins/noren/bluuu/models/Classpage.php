<?php namespace Noren\Bluuu\Models;

use Model;

/**
 * Model
 */
class Classpage extends Model
{
    use \October\Rain\Database\Traits\Validation;
    use \October\Rain\Database\Traits\NestedTree;

    /**
     * @var string table in the database used by the model.
     */
    public $table = 'noren_bluuu_classpage';

    /**
     * @var array rules for validation.
     */
    public $rules = [
    ];
    protected $jsonable = ['props','details'];
    public $belongsTo = [
        'tourspage' => \Noren\Bluuu\Models\Tourspage::class
    ];
    public $attachMany = [
        'images' => \System\Models\File::class
    ];

}
