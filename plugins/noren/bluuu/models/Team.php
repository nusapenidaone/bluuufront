<?php namespace Noren\Bluuu\Models;

use Model;

/**
 * Model
 */
class Team extends Model
{
    use \October\Rain\Database\Traits\Validation;


    /**
     * @var string table in the database used by the model.
     */
    public $table = 'noren_bluuu_team';
    protected $jsonable = ['languages'];
    /**
     * @var array rules for validation.
     */
    public $rules = [
    ];
    
    public $attachOne = [
        'img' => \System\Models\File::class
    ];

}
