<?php namespace Noren\Bluuu\Models;

use Model;
use System\Models\File;

class Reviews extends Model
{
    use \October\Rain\Database\Traits\Validation;

    public $table = 'noren_bluuu_reviews';

    public $rules = [];

    public $attachOne = [
        'img' => File::class,
    ];

    protected $appends = ['img_with_thumbs'];
    protected $hidden = ['img'];
    protected $fillable=['name', 'source_id','date','text','rating'];
    public $belongsTo = [
        'source' => Source::class
    ];
    /**
     * Возвращает массив с миниатюрами и оригиналом
     */
    public function getImgWithThumbsAttribute()
    {
        if (!$this->img) {
            return [];
        }

        return [
            'original' => $this->img->getPath(),
            'thumb' => $this->img->getThumb(400, 400, [
                'mode' => 'crop',
                'extension' => 'webp',
            ]),
            'thumb1' => $this->img->getThumb(600, 400, [
                'mode' => 'crop',
                'extension' => 'webp',
            ]),
        ];
    }

    public function afterSave()
    {
        if ($this->img) {
            $this->img->getThumb(400, 400, [
                'mode' => 'crop',
                'extension' => 'webp',
            ]);
        }
    }

    public function beforeDelete()
    {
        if ($this->img) {
            $this->deleteThumbsFor($this->img);
        }
    }

    protected function deleteThumbsFor(File $file)
    {
        $path = dirname($file->getLocalPath());
        $pattern = $path . '/thumb_' . $file->id . '_*';

        foreach (glob($pattern) as $thumbPath) {
            @unlink($thumbPath);
        }
    }
}
