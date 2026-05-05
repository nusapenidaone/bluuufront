<?php namespace Noren\Booking\Models;

use Backend\Models\ImportModel;
use Exception;

class CloseddatesTestImport extends ImportModel
{
    public $rules = [];

    public function importData($results, $sessionKey = null)
    {
        foreach ($results as $row => $data) {
            try {
                $item = new CloseddatesTest;
                $item->fill($data);
                $item->save();

                $this->logCreated();
            } catch (Exception $ex) {
                $this->logError($row, $ex->getMessage());
            }
        }
    }
}
