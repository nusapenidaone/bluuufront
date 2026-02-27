<?php namespace Noren\Booking\FormWidgets;

use Backend\Classes\FormWidgetBase;

class PackageItemsEditor extends FormWidgetBase
{
    public function widgetDetails()
    {
        return [
            'name'        => 'Package Items Editor',
            'description' => 'Inline editor for hasMany package items'
        ];
    }

    public function render()
    {
        $this->prepareVars();
        return $this->makePartial('field_packageitemseditor');
    }

    public function prepareVars()
    {
        $this->vars['items'] = $this->model->packagesitems;
        $this->vars['fieldName'] = $this->formField->getName();
    }

    public function loadAssets()
    {
        $this->addJs('$/noren/booking/formwidgets/packageitemseditor/assets/js/widget.js');
    }

    public function getSaveValue($value)
    {
        return null;
    }
}
