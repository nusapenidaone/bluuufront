<?php namespace Noren\Booking\Api;

/**
 * Shared availability logic for shared tours.
 * Single source of truth used by FullController (calendar) and CabinetController (upgrade check).
 */
class SharedAvailability
{
    /**
     * Build per-boat closeddates index for a tour.
     *
     * Tour must have boat.closeddates eager-loaded.
     * Pass $dates to restrict indexing to specific dates (faster for single-date checks).
     * Pass $today to skip past dates (used by calendar view).
     *
     * Returns: [boat_id => ['capacity' => int, 'dates' => [date => ['blocked' => bool, 'qtty' => int, 'real_record' => bool]]]]
     */
    public static function buildBoatIndex(object $tour, array $dates = [], ?string $today = null): array
    {
        $dateSet = !empty($dates) ? array_flip($dates) : null;
        $index   = [];

        foreach ($tour->boat as $boat) {
            $index[$boat->id] = ['capacity' => (int) ($boat->capacity ?? 0), 'dates' => []];
            $isClosedBoat     = !empty($boat->closed);

            foreach ($boat->closeddates as $cd) {
                if ($cd->deleted_at !== null) continue;
                $dateStr = substr($cd->date, 0, 10);
                if ($today !== null && $dateStr < $today) continue;
                if ($dateSet !== null && !isset($dateSet[$dateStr])) continue;

                if (!isset($index[$boat->id]['dates'][$dateStr])) {
                    $index[$boat->id]['dates'][$dateStr] = ['blocked' => false, 'qtty' => 0, 'real_record' => false];
                }

                $type = $cd->type;
                if ($isClosedBoat) {
                    $index[$boat->id]['dates'][$dateStr]['blocked'] = true;
                    if ((int) $type !== 4) {
                        $index[$boat->id]['dates'][$dateStr]['real_record'] = true;
                    }
                    continue;
                }

                if ($type === null || $type === '' || in_array((int) $type, [2, 3])) {
                    $index[$boat->id]['dates'][$dateStr]['blocked']     = true;
                    $index[$boat->id]['dates'][$dateStr]['real_record'] = true;
                } elseif ((int) $type === 4) {
                    $index[$boat->id]['dates'][$dateStr]['blocked'] = true;
                } elseif ((int) $type === 1) {
                    if ($cd->tour_type && $cd->tour_type !== ($tour->odoo_type ?? '')) {
                        $index[$boat->id]['dates'][$dateStr]['blocked']     = true;
                        $index[$boat->id]['dates'][$dateStr]['real_record'] = true;
                    } else {
                        $index[$boat->id]['dates'][$dateStr]['qtty']       += (int) ($cd->qtty ?? 0);
                        $index[$boat->id]['dates'][$dateStr]['real_record'] = true;
                    }
                }
            }
        }

        return $index;
    }

    /**
     * Compute availability for one date.
     *
     * @param object $tour       Tour model with boat relation loaded
     * @param array  $boatIndex  Built by buildBoatIndex()
     * @param string $date       'Y-m-d'
     * @param int    $members    Required seats; 0 = just get counts (available = seats > 0)
     * @return array [
     *   'available'       => bool,
     *   'available_seats' => int,
     *   'assigned_boat'   => object|null,  // first boat that fits $members (sorted by sort_order)
     *   'capacity'        => int,
     *   'booked'          => int,
     * ]
     */
    public static function calcDate(object $tour, array $boatIndex, string $date, int $members = 0): array
    {
        // A boat with closed=true that has any real (non-cron) record blocks the whole tour
        foreach ($tour->boat as $boat) {
            if (!empty($boat->closed) && !empty($boatIndex[$boat->id]['dates'][$date]['real_record'])) {
                return ['available' => false, 'available_seats' => 0, 'assigned_boat' => null, 'capacity' => 0, 'booked' => 0];
            }
        }

        $totalAvailable = 0;
        $totalCapacity  = 0;
        $totalBooked    = 0;
        $firstBoat      = null; // first non-blocked boat (used when members=0, e.g. calendar view)
        $assignedBoat   = null; // first boat with enough capacity for members

        foreach ($tour->boat->sortBy('sort_order') as $boat) {
            $capacity = $boatIndex[$boat->id]['capacity'] ?? 0;
            $rec      = $boatIndex[$boat->id]['dates'][$date] ?? null;

            if ($rec === null) {
                $avail  = $capacity;
                $booked = 0;
            } elseif ($rec['blocked']) {
                $avail  = 0;
                $booked = $capacity;
            } else {
                $booked = (int) ($rec['qtty'] ?? 0);
                $avail  = max(0, $capacity - $booked);
            }

            $totalAvailable += $avail;
            $totalCapacity  += $capacity;
            $totalBooked    += $booked;

            if ($avail > 0) {
                if ($firstBoat === null) $firstBoat = $boat;
                if ($assignedBoat === null && $members > 0 && $avail >= $members) {
                    $assignedBoat = $boat;
                }
            }
        }

        $available = $members > 0 ? ($totalAvailable >= $members) : ($totalAvailable > 0);

        return [
            'available'       => $available,
            'available_seats' => $totalAvailable,
            'assigned_boat'   => $members > 0 ? $assignedBoat : $firstBoat,
            'capacity'        => $totalCapacity,
            'booked'          => $totalBooked,
        ];
    }
}
