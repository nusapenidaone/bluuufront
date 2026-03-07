<?php
namespace Noren\Bluuu\Models;

use Model;

class Rules extends Model
{
    use \October\Rain\Database\Traits\Validation;

    public $implement = ['System.Behaviors.SettingsModel'];

    public $settingsCode = 'noren_bluuu_rules';

    public $settingsFields = 'fields.yaml';

    public $rules = [];
}
