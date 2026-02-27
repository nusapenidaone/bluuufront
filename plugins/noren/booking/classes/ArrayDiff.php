<?php namespace Noren\Booking\Classes;

class ArrayDiff
{
    /**
     * Сравнить два массива и вернуть список всех изменений
     */
    public static function compare(array $old, array $new): array
    {
        $changes = [];

        foreach ($new as $key => $newValue) {
            $oldValue = $old[$key] ?? null;

            // Особая обработка extras: показываем весь массив
            if ($key === 'extras') {
                if ($oldValue != $newValue) {
                    $changes['extras'] = [
                        'old' => $oldValue,
                        'new' => $newValue,
                    ];
                }
                continue;
            }

            // Обычная проверка изменений
            if ($oldValue !== $newValue) {
                $changes[$key] = [
                    'old' => $oldValue,
                    'new' => $newValue,
                ];
            }
        }

        return $changes;
    }

    /**
     * Сравнить только определенный набор полей
     */
    public static function compareFields(array $old, array $new, array $fields): array
    {
        $changes = [];

        foreach ($fields as $field) {
            $oldValue = $old[$field] ?? null;
            $newValue = $new[$field] ?? null;

            // Особая обработка extras
            if ($field === 'extras') {
                if ($oldValue != $newValue) {
                    $changes['extras'] = [
                        'old' => $oldValue,
                        'new' => $newValue,
                    ];
                }
                continue;
            }

            if ($oldValue !== $newValue) {
                $changes[$field] = [
                    'old' => $oldValue,
                    'new' => $newValue,
                ];
            }
        }

        return $changes;
    }
}
