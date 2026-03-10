<?php namespace Noren\Bluuu\Components;

use Cms\Classes\ComponentBase;
use Noren\Bluuu\Models\Tourspage as TourspageModel;

class Tourspage extends ComponentBase
{
    public $tour;

    public function componentDetails()
    {
        return [
            'name' => 'Tourspage Component',
            'description' => 'Выводит одну запись из модели Tourspage по slug'
        ];
    }

    public function defineProperties()
    {
        return [
            'slug' => [
                'title'       => 'Slug',
                'description' => 'Slug записи, которую нужно отобразить',
                'type'        => 'string',
                'default'     => '{{ :slug }}',
            ],
        ];
    }



    public function page()
    {
        $slug = $this->property('slug');

        return TourspageModel::with('faq','promoslider')->where('slug', $slug)->first();
    }
}
