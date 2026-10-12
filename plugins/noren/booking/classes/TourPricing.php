<?php namespace Noren\Booking\Classes;

use Noren\Booking\Models\Tours;

/**
 * Единый расчёт цены тура: пакет на дату (PricesByDates) → дефолтный пакет (Packages)
 * → цена за кол-во людей → low season скидка (LowSeason).
 *
 * Low season действует только на цену тура (tier price) + boat_price для private.
 * Transfer, cover и extras не дисконтируются.
 * Сумма скидки = round(original × percent / 100), где original = tier + boat.
 * Делится на tier/boat так: boat_discount = round(boat × percent / 100), tier_discount = остаток.
 * Если на дату попадает несколько активных правил — берётся максимальный percent.
 */
class TourPricing
{
    /**
     * Нормализует дату (Carbon / 'Y-m-d' / 'Y-m-d H:i:s') в 'Y-m-d'. null если пусто.
     */
    public static function day($date): ?string
    {
        if (!$date) {
            return null;
        }
        if ($date instanceof \DateTimeInterface) {
            return $date->format('Y-m-d');
        }
        return substr((string) $date, 0, 10);
    }

    /**
     * Pricelist [{members_count, price}] для тура на дату: сезонный пакет, если дата попадает в
     * PricesByDates, иначе дефолтный пакет тура.
     */
    public static function pricelistFor(Tours $tour, $date): array
    {
        $tour->loadMissing(['packages', 'pricesbydates.packages']);

        $pricelist = $tour->packages?->pricelist ?? [];
        $day = static::day($date);

        if ($day && $tour->pricesbydates->isNotEmpty()) {
            $seasonal = $tour->pricesbydates->first(
                fn($pbd) => $day >= static::day($pbd->date_start) && $day <= static::day($pbd->date_end)
            );
            if ($seasonal?->packages?->pricelist) {
                $pricelist = $seasonal->packages->pricelist;
            }
        }

        return is_array($pricelist) ? $pricelist : [];
    }

    /**
     * Цена за группу из pricelist: ближайший тир с members_count <= members,
     * если такого нет — самый маленький тир. null если pricelist пустой.
     */
    public static function tierPrice(array $pricelist, int $members): ?int
    {
        if (empty($pricelist)) {
            return null;
        }
        $sorted = collect($pricelist)->sortBy(fn($p) => (int) ($p['members_count'] ?? 0));
        $entry  = $sorted->last(fn($p) => (int) ($p['members_count'] ?? 0) <= $members) ?? $sorted->first();

        return (int) ($entry['price'] ?? 0);
    }

    /**
     * Активные low season правила тура (загружаются один раз на модель).
     */
    protected static function activeLowSeasons(Tours $tour)
    {
        $tour->loadMissing('lowseasons');

        return $tour->lowseasons->filter(fn($ls) => (bool) $ls->is_active && (int) $ls->percent > 0);
    }

    /**
     * Процент low season скидки тура на дату (0 если нет).
     */
    public static function lowSeasonPercent(Tours $tour, $date): int
    {
        $day = static::day($date);
        if (!$day) {
            return 0;
        }

        $max = static::activeLowSeasons($tour)
            ->filter(fn($ls) => $day >= static::day($ls->date_start) && $day <= static::day($ls->date_end))
            ->max(fn($ls) => (int) $ls->percent);

        return min(90, max(0, (int) $max));
    }

    /**
     * Активное правило (с максимальным %) на дату, для отображения имени. null если нет.
     */
    public static function lowSeasonFor(Tours $tour, $date): ?array
    {
        $day = static::day($date);
        if (!$day) {
            return null;
        }

        $ls = static::activeLowSeasons($tour)
            ->filter(fn($ls) => $day >= static::day($ls->date_start) && $day <= static::day($ls->date_end))
            ->sortByDesc(fn($ls) => (int) $ls->percent)
            ->first();

        return $ls ? static::formatLowSeason($ls) : null;
    }

    /**
     * Будущие активные правила тура (date_end >= сегодня, Asia/Makassar) — для API.
     * [{id, name, date_start, date_end, percent}]
     */
    public static function lowSeasonsFor(Tours $tour): array
    {
        $today = static::today();

        return static::activeLowSeasons($tour)
            ->filter(fn($ls) => static::day($ls->date_end) >= $today)
            ->sortBy(fn($ls) => static::day($ls->date_start))
            ->map(fn($ls) => static::formatLowSeason($ls))
            ->values()
            ->all();
    }

    /**
     * Максимальный % среди будущих активных правил тура (0 если нет) — для цены "от" на карточке.
     */
    public static function maxUpcomingPercent(Tours $tour): int
    {
        $max = collect(static::lowSeasonsFor($tour))->max('percent');

        return (int) $max;
    }

    /**
     * Применяет скидку к сумме. Возвращает сумму скидки (int).
     */
    public static function discountAmount(int $amount, int $percent): int
    {
        if ($percent <= 0 || $amount <= 0) {
            return 0;
        }
        return (int) round($amount * $percent / 100);
    }

    /**
     * Полный расчёт цены тура.
     *
     * @return array{
     *   has_pricelist: bool,
     *   tier_price: int,          // цена пакета за группу, без скидки
     *   boat_price: int,          // аренда лодки (только private), без скидки
     *   original: int,            // tier_price + boat_price
     *   percent: int,             // low season %, 0 если нет
     *   discount: int,            // сумма скидки
     *   tour_price: int,          // tier_price со скидкой  → Order.tour_price
     *   boat_price_final: int,    // boat_price со скидкой  → Order.boat_price
     *   total: int,               // original - discount
     *   low_season: array|null    // {id, name, date_start, date_end, percent}
     * }
     */
    public static function quote(Tours $tour, $date, int $members, bool $isPrivate): array
    {
        $tier      = static::tierPrice(static::pricelistFor($tour, $date), $members);
        $hasList   = $tier !== null;
        $tier      = (int) ($tier ?? 0);
        $boat      = $isPrivate ? (int) ($tour->boat_price ?? 0) : 0;
        $original  = $tier + $boat;
        $percent   = $original > 0 ? static::lowSeasonPercent($tour, $date) : 0;
        $discount  = static::discountAmount($original, $percent);
        $boatDisc  = min($discount, static::discountAmount($boat, $percent));
        $tierDisc  = $discount - $boatDisc;

        return [
            'has_pricelist'    => $hasList,
            'tier_price'       => $tier,
            'boat_price'       => $boat,
            'original'         => $original,
            'percent'          => $percent,
            'discount'         => $discount,
            'tour_price'       => $tier - $tierDisc,
            'boat_price_final' => $boat - $boatDisc,
            'total'            => $original - $discount,
            'low_season'       => $percent > 0 ? static::lowSeasonFor($tour, $date) : null,
        ];
    }

    protected static function formatLowSeason($ls): array
    {
        return [
            'id'         => (int) $ls->id,
            'name'       => (string) $ls->name,
            'date_start' => static::day($ls->date_start),
            'date_end'   => static::day($ls->date_end),
            'percent'    => (int) $ls->percent,
        ];
    }

    protected static function today(): string
    {
        return (new \DateTime('now', new \DateTimeZone('Asia/Makassar')))->format('Y-m-d');
    }
}
