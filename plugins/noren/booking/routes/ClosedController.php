<?php
namespace Noren\Booking\Routes;
use Illuminate\Routing\Controller;
use Carbon\Carbon;
use Validator;
use Input;
use Noren\Booking\Models\Tours;
use Log;

class ClosedController extends Controller
{
	

public function getTourClosedDates($id)
{
    $tour = Tours::with(['boat.closeddates'])->find($id);

    if (!$tour || !$tour->boat) {
        return [];
    }

    $dates = [];
    $tomorrow = Carbon::tomorrow('Asia/Makassar')->startOfDay()->format('Y-m-d');

    if ($tour->types_id == 1) {

        $allDates = [];

        // Собираем данные по всем лодкам и датам
        foreach ($tour->boat as $boat) {
            foreach ($boat->closeddates as $closed) {
                $date = Carbon::parse($closed->date)->startOfDay();
                if ($date < $tomorrow) continue;
                $dateStr = $date->format('Y-m-d');

                if (!isset($allDates[$dateStr])) {
                    $allDates[$dateStr] = [];
                }

                if (!isset($allDates[$dateStr][$boat->id])) {
                    $allDates[$dateStr][$boat->id] = [
                        'has_non_1' => false,
                        'sum_qtty' => 0,
                        'capacity' => $boat->capacity,
                        'is_closed_boat' => $boat->closed ?? false, // добавим флаг
                    ];
                }

                // Если есть хотя бы одна запись с type != 1
                if ($closed->type != 1) {
                    $allDates[$dateStr][$boat->id]['has_non_1'] = true;
                }

                // Если type == 1 — суммируем количество
                if ($closed->type == 1) {
                    $allDates[$dateStr][$boat->id]['sum_qtty'] += $closed->qtty;
                }
            }
        }

        // Рассчитываем общее количество доступных мест по всем лодкам
        foreach ($allDates as $dateStr => $boatsData) {
            $totalAvailable = 0;
            $hasClosedBoatActive = false; // если хоть одна закрытая лодка участвует в этой дате

            foreach ($boatsData as $boatId => $boatData) {
                // если лодка имеет параметр closed и участвует в этой дате
                if (!empty($boatData['is_closed_boat'])) {
                    $hasClosedBoatActive = true;
                }
            }

            // если на эту дату участвует закрытая лодка — всё занято
            if ($hasClosedBoatActive) {
                $dates[$dateStr] = 0;
                continue;
            }

            // иначе обычный расчёт доступности
            foreach ($tour->boat as $boat) {
                if (!isset($boatsData[$boat->id])) {
                    $available = $boat->capacity;
                } else {
                    $boatData = $boatsData[$boat->id];

                    if ($boatData['has_non_1']) {
                        $available = 0;
                    } else {
                        $available = max(0, $boatData['capacity'] - $boatData['sum_qtty']);
                    }
                }

                $totalAvailable += $available;
            }

            $dates[$dateStr] = $totalAvailable;
        }

    } else {
        // Для других типов — дата закрыта только если все лодки заняты
        $allDates = [];

        foreach ($tour->boat as $boat) {
            foreach ($boat->closeddates as $closed) {
                $date = Carbon::parse($closed->date)->startOfDay();
                if ($date < $tomorrow) continue;
                $dateStr = $date->format('Y-m-d');

                if (!isset($allDates[$boat->id])) {
                    $allDates[$boat->id] = [];
                }

                $allDates[$boat->id][$dateStr] = [
                    'closed_boat' => $boat->closed ?? false
                ];
            }
        }

        $allDateKeys = [];
        foreach ($allDates as $boatId => $boatDates) {
            foreach ($boatDates as $dateStr => $info) {
                if (!isset($allDateKeys[$dateStr])) {
                    $allDateKeys[$dateStr] = [
                        'occupied' => 0,
                        'has_closed_boat' => false
                    ];
                }
                $allDateKeys[$dateStr]['occupied']++;
                if ($info['closed_boat']) {
                    $allDateKeys[$dateStr]['has_closed_boat'] = true;
                }
            }
        }

        $boatCount = count($tour->boat);
        foreach ($allDateKeys as $dateStr => $info) {
            if ($info['has_closed_boat']) {
                $dates[$dateStr] = 0; // если есть закрытая лодка
            } else {
                $dates[$dateStr] = ($info['occupied'] == $boatCount) ? 0 : $tour->capacity;
            }
        }
    }

    ksort($dates);

    $result = [];
    foreach ($dates as $dateStr => $qtty) {
        $result[] = [
            'date' => $dateStr,
            'qtty' => $qtty
        ];
    }

    return $result;
}



    /**
     * Главная функция — получить список туров с фильтрацией
     */
    public function getTours($members = 1, $typeId = null, $date = null)
    {
        $input = $this->getValidatedInput();
        if (isset($input['errors'])) {
            return $input['errors'];
        }

        [$adults, $kids, $children, $typeId, $date] = [
            $input['adults'],
            $input['kids'],
            $input['children'],
            $input['type'],
            Carbon::parse($input['date'])->startOfDay(),
        ];

        $members = $adults + $kids + $children;

        $tours = $this->getToursQuery($typeId);
        if (!$tours->count()) {
            return ['error' => 'No tours found'];
        }

        // Формируем данные по каждому туру
        $rows = $tours->map(fn($tour) => $this->formatTour($tour, $date, $members))->all();

        // Возвращаем отсортированный и сгруппированный список
        return $this->sortAndGroupTours($rows);
    }

    // --------------------------------------------------
    // Валидация входных данных
    // --------------------------------------------------
    private function getValidatedInput(): array
    {
        $input = Input::only('adults', 'kids', 'children', 'type', 'date');

        $rules = [
            'adults'   => 'required|integer|min:1',
            'kids'     => 'integer|min:0',
            'children' => 'integer|min:0',
            'type'     => 'integer|nullable',
            'date'     => 'required|date_format:Y-m-d|after:today',
        ];

        $validator = Validator::make($input, $rules);
        if ($validator->fails()) {
            return ['errors' => $validator->errors()->all()];
        }

        return array_merge(['kids' => 0, 'children' => 0], $input);
    }

    // --------------------------------------------------
    //  Загрузка туров с зависимостями
    // --------------------------------------------------
    private function getToursQuery($typeId)
    {
        $query = Tours::with([
            'types',
            'boat.closeddates',
            'packages',
            'pricesbydates.packages',
        ])->where('types_id', '<', 4);//poxel

        if ($typeId) {
            $query->where('types_id', $typeId);
        }

        return $query->get();
    }

    // --------------------------------------------------
    //  Формирование данных по туру
    // --------------------------------------------------
    private function formatTour($tour, $date, $members)
    {
        // вычисляем доступность
        $available = $this->calculateTourAvailability($tour, $date);
        // определяем статус на основе доступности и вместимости
        $status = $this->getTourStatus($tour, $date, $members, $available);

        [$package, $priority] = $this->getMatchingPackage($tour, $date);

        $price = $this->getPriceByMembers($package, $members);
        $link  = $this->buildTourLink($tour, $status);

        return [
            'id'         => $tour->id,
            'name'       => $tour->name,
            'static'     => $tour->static,
            'size'       => $tour->size,
            'duration'   => $tour->duration,
            'capacity'   => $tour->capacity,
            'available'  => $available,
            'sort_order' => $tour->sort_order,
            'partner'    => $tour->partner,
            'link'       => $link,
            'types_id'   => $tour->types_id,
            'classes_id' => $tour->classes_id,
            'limited_images' => array_slice($tour->images_with_thumbs, 0, 5),
            'badge' => $tour->badge ? [
                'name'  => $tour->badge->name,
                'color' => $tour->badge->color,
            ] : null,
            'status'       => $status,
            'price'        => $price + $tour->boat_price,
            'package_type' => $priority,
        ];
    }

    // --------------------------------------------------
    // Определение статуса тура
    // --------------------------------------------------
    private function getTourStatus($tour, $date, $members, $available)
    {
        if ($available <= 0) {
            return 'booked';
        }

        if ($members > $available) {
            return 'exceeded';
        }

        return false;
    }

    // --------------------------------------------------
    // поиск подходящего пакета
    // --------------------------------------------------
    private function getMatchingPackage($tour, $date)
    {
        $package  = $tour->packages;
        $priority = 'default';

        $matching = $tour->pricesbydates->filter(function ($p) use ($date) {
            $start = Carbon::parse($p->date_start)->startOfDay();
            $end   = Carbon::parse($p->date_end)->endOfDay();
            return $date->between($start, $end);
        });

        if ($matching->isNotEmpty()) {
            $priceByDate = $matching->firstWhere('flash_sale', true)
                ?? $matching->firstWhere('low_price', true)
                ?? $matching->first();

            if ($priceByDate) {
                $package  = $priceByDate->packages;
                $priority = $priceByDate->flash_sale ? 'flash_sale'
                    : ($priceByDate->low_price ? 'low_price' : 'default_by_date');
            }
        }

        return [$package, $priority];
    }

    // --------------------------------------------------
    // Расчёт цены по количеству участников
    // --------------------------------------------------
    private function getPriceByMembers($package, $members)
    {
        $price = optional(collect($package->pricelist)
            ->firstWhere('members_count', $members))->price;

        if (!$price) {
            $price = collect($package->pricelist)
                ->filter(fn($row) => $row['members_count'] <= $members)
                ->last()['price'] ?? null;
        }

        return $price ?? 0;
    }

    // --------------------------------------------------
    // построение ссылки на тур
    // --------------------------------------------------
    private function buildTourLink($tour, $status)
    {
        $link = url('/nusa-penida/'.$tour->types->slug.'/'.$tour->slug);
        if (!$status) {
            $link .= '?' . http_build_query(Input::all());
        }
        return $link;
    }

    // --------------------------------------------------
    // расчёт доступности лодок
    // --------------------------------------------------


private function calculateTourAvailability($tour, $date)
{
    $date = Carbon::parse($date)->format('Y-m-d');
    $available = 0;

    // Если у тура нет лодок — доступность 0
    if (!$tour->boat || $tour->boat->isEmpty()) {
        return 0;
    }

    // Shared tour (тип 1)
    if ($tour->types_id == 1) {
        foreach ($tour->boat as $boat) {
            // Если лодка закрыта в бэк-офисе, она не доступна
            if (!empty($boat->closed)) {
                $hasClosedBoatRecord = $boat->closeddates()->whereDate('date', $date)->exists();
                if ($hasClosedBoatRecord) continue;
            }

            $records = $boat->closeddates()
                ->whereDate('date', $date)
                ->get();

            // Если записей нет — лодка полностью доступна
            if ($records->isEmpty()) {
                $available += $boat->capacity;
                continue;
            }

            // Типы 2, 3, 4 полностью блокируют лодку
            $hasOtherTypes = $records->whereIn('type', [2, 3, 4])->isNotEmpty() 
                          || $records->whereNull('type')->isNotEmpty() 
                          || $records->where('type', '')->isNotEmpty();
            if ($hasOtherTypes) {
                continue;
            }

            // Если есть записи только с type = 1 — считаем оставшиеся места
            $used = $records->where('type', 1)->sum('qtty');
            $available += max(0, $boat->capacity - $used);
        }

    // Private tour (иначе)
    } else {
        foreach ($tour->boat as $boat) {
            // Если лодка помечена как закрытая и есть запись на дату — она занята
            if (!empty($boat->closed)) {
                $hasClosedBoatRecord = $boat->closeddates()->whereDate('date', $date)->exists();
                if ($hasClosedBoatRecord) continue;
            }

            $isClosed = $boat->closeddates()
                ->whereDate('date', $date)
                ->exists();

            if (!$isClosed) {
                $available += $boat->capacity;
            }
        }
    }

    return $available;
}


    // --------------------------------------------------
    // Группировка и сортировка туров
    // --------------------------------------------------
    private function sortAndGroupTours(array $rows)
    {
        $types1  = array_filter($rows, fn($t) => $t['static']);
        $others  = array_filter($rows, fn($t) => !$t['static']);
        $our     = array_filter($others, fn($t) => !$t['partner']);
        $partner = array_filter($others, fn($t) => $t['partner']);

        $sortByStatus = function ($a, $b) {
            if ($a['status'] === false && $b['status'] !== false) return -1;
            if ($a['status'] !== false && $b['status'] === false) return 1;
            return 0;
        };

        usort($our, $sortByStatus);
        usort($partner, $sortByStatus);

        return array_merge(array_values($types1), array_values($our), array_values($partner));
    }
}

