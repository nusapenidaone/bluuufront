<?php namespace Noren\Booking\FormWidgets;

use Backend\Classes\FormWidgetBase;

class IconPicker extends FormWidgetBase
{
    public function widgetDetails()
    {
        return [
            'name'        => 'Icon Picker',
            'description' => 'Lucide icon picker — stores icon name and SVG'
        ];
    }

    public function render()
    {
        $this->prepareVars();
        return $this->makePartial('field_iconpicker');
    }

    public function prepareVars()
    {
        $this->vars['value']        = $this->getLoadValue() ?: '';
        $this->vars['fieldName']    = $this->formField->getName();
        $this->vars['fieldId']      = $this->getId();

        // SVG field: same column name with _svg suffix
        $svgColumn = $this->formField->columnName . '_svg';
        $this->vars['svgValue']     = $this->model->{$svgColumn} ?? '';
        $this->vars['svgFieldName'] = $this->formField->arrayName
            ? $this->formField->arrayName . '[' . $svgColumn . ']'
            : $svgColumn;
    }

    public function loadAssets()
    {
        $this->addJs('$/noren/booking/formwidgets/iconpicker/assets/js/iconpicker.js');
    }

    public function getSaveValue($value)
    {
        return $value;
    }
}
