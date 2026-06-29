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

    public $guarded = [];

    public $jsonable = ['sections'];

    public $rules = [];

    public $attachMany = [
        'images' => \System\Models\File::class,
    ];

    public $belongsTo = [
        'author' => [Author::class, 'key' => 'author_id'],
    ];

    public $belongsToMany = [
        'tours' => [\Noren\Booking\Models\Tours::class, 'table' => 'noren_bluuu_blog_tours'],
        'faq'   => [Faq::class, 'table' => 'noren_bluuu_blog_faq'],
    ];

}
