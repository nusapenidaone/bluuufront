<?php
namespace Noren\Bluuu\Models;

use Model;

class Blog extends Model
{
    public $timestamps = true;

    public $table = 'noren_bluuu_blog';

    protected $fillable = [
        'title', 'description', 'slug',
        'seo_title', 'seo_description', 'content',
    ];

    public $attachMany = [
        'images' => \System\Models\File::class,
    ];
}
