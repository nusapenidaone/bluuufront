<?php namespace Noren\Bluuu\Models;

use Model;

class Author extends Model
{
    public $table = 'noren_bluuu_authors';

    public $guarded = [];

    public $rules = [];

    public $hasMany = [
        'posts' => [Blog::class, 'key' => 'author_id'],
    ];
}
