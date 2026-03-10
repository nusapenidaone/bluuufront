<?php namespace Noren\Bluuu\Models;

use Model;

/**
 * Model
 */
class Tourspage extends Model
{
    use \October\Rain\Database\Traits\Validation;


    /**
     * @var string table in the database used by the model.
     */
    public $table = 'noren_bluuu_tourspage';

    /**
     * @var array rules for validation.
     */
    public $rules = [
    ];
    
    public $attachOne = [
        'img1' => \System\Models\File::class,
        'img2' => \System\Models\File::class
    ];
    protected $jsonable = ['section1','section2','section3','section4','section5'];

    public $belongsToMany = [
        'promoslider' => [
            \Noren\Bluuu\Models\Promoslider::class,
            'table' => 'noren_bluuu_tourspage_promoslider',
        ],
        'reviews' => [
            \Noren\Bluuu\Models\Reviews::class,
            'table' => 'noren_bluuu_tourspage_reviews',
        ],
        'faq' => [
            \Noren\Bluuu\Models\Faq::class,
            'table' => 'noren_bluuu_tourspage_faq',
        ],
        
        'programm' => [
            \Noren\Bluuu\Models\Programm::class,
            'table' => 'noren_bluuu_tourspage_programm',
        ]
    ];
    
    public $hasMany = [
        'classpage' => \Noren\Bluuu\Models\Classpage::class
    ];

}
