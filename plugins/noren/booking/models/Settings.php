<?php

namespace Noren\Booking\Models;

class Settings extends \System\Models\SettingModel
{
    public $settingsCode = 'noren_booking_settings';

    public $settingsFields = 'fields.yaml';
}
