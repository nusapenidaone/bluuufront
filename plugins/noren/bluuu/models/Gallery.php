<?php
namespace Noren\Bluuu\Models;

use Model;

/**
 * Gallery Model
 */
class Gallery extends Model
{
    use \October\Rain\Database\Traits\Sortable;

    /**
     * @var bool timestamps are disabled.
     */
    public $timestamps = false;

    /**
     * @var string table in the database used by the model.
     */
    public $table = 'noren_bluuu_gallery';

    /**
     * @var array fillable fields.
     */
    protected $fillable = ['title', 'sort_order'];

    /**
     * @var array attachMany relations — each gallery record can have many images
     */
    public $attachMany = [
        'images' => \System\Models\File::class,
    ];
}
