<?php namespace Noren\Booking\Models;

use Backend\Models\ExportModel;

class CloseddatesExport extends ExportModel
{
    public function exportData($columns, $sessionKey = null)
    {
        $records = Closeddates::all();
        $records->each(function($record) use ($columns) {
            $record->addVisible($columns);
        });

        return $records->toArray();
    }
}
