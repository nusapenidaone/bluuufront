<?php
namespace Noren\Bluuu\Models;

use Model;

/**
 * Faq Model
 */
class Faq extends Model
{
    use \October\Rain\Database\Traits\Validation;
    use \October\Rain\Database\Traits\Sortable;

    /**
     * @var bool timestamps are disabled.
     */
    public $timestamps = false;

    /**
     * @var string table in the database used by the model.
     */
    public $table = 'noren_bluuu_faq';

    /**
     * @var array rules for validation.
     */
    public $rules = [];

    /**
     * @var array fillable fields.
     */
    protected $fillable = ['question', 'answer', 'sort_order'];
}
