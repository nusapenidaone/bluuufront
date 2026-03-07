<?php

namespace Noren\Bluuu\Models;

use Model;

class Settings extends Model
{
    use \October\Rain\Database\Traits\Validation;

    public $implement = ['System.Behaviors.SettingsModel'];

    public $settingsCode = 'noren_bluuu_settings';

    // No backend form is required for API usage.
    public $settingsFields = null;

    public $rules = [];
}

