<?php namespace Noren\Booking\Models;

use Backend\Models\ExportModel;

class CloseddatesTestExport extends ExportModel
{
    public function exportData($columns, $sessionKey = null)
    {
        $records = CloseddatesTest::all();
        $records->each(function($record) use ($columns) {
            $record->addVisible($columns);
        });

        return $records->toArray();
    }
}
