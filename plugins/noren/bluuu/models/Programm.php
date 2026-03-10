<?php namespace Noren\Bluuu\Models;

use Model;

/**
 * Model
 */
class Programm extends Model
{
    use \October\Rain\Database\Traits\Validation;


    /**
     * @var string table in the database used by the model.
     */
    public $table = 'noren_bluuu_programm';
    protected $jsonable = ['list'];
    /**
     * @var array rules for validation.
     */
    public $rules = [
    ];

}
