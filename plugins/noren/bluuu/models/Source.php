<?php namespace Noren\Bluuu\Models;

use Model;

/**
 * Model
 */
class Source extends Model
{
    use \October\Rain\Database\Traits\Validation;

    /**
     * @var bool timestamps are disabled.
     * Remove this line if timestamps are defined in the database table.
     */
    public $timestamps = false;

    /**
     * @var string table in the database used by the model.
     */
    public $table = 'noren_bluuu_source';

    /**
     * @var array rules for validation.
     */
    public $rules = [
    ];

}
