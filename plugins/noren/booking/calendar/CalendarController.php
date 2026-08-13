<?php namespace Noren\Booking\Calendar;

use Illuminate\Routing\Controller;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Noren\Booking\Models\Boat;
use Noren\Booking\Models\Tours;
use Noren\Booking\Models\Closeddates;
use Response;

class CalendarController extends Controller
{
    public function getData(Request $request)
    {
        if ($this->isUnauthorized($request)) return $this->cors(response()->json(['error' => 'Unauthorized'], 401));

        $start = $request->get('start', Carbon::today()->format('Y-m-d'));
        $end   = $request->get('end', Carbon::today()->addMonth()->format('Y-m-d'));

        $tours = Tours::with('boat')->get()->map(fn($t) => [
            'id'         => $t->id,
            'name'       => $t->name,
            'classes_id' => $t->classes_id,
            'boat_ids'   => $t->boat->pluck('id')->toArray()
        ]);

        $boats = Boat::with(['closeddates' => function($q) use ($start, $end) {
            $q->whereBetween('date', [$start, $end]);
        }])->get()->map(fn($b) => [
            'id'           => $b->id,
            'name'         => $b->amo_name ?: $b->name,
            'capacity'     => $b->capacity,
            'closed_dates' => $b->closeddates->map(fn($cd) => [
                'id'      => $cd->id,
                'date'    => Carbon::parse($cd->date)->format('Y-m-d'),
                'type'    => $cd->type,
                'qtty'    => $cd->qtty,
                'lead_id' => $cd->lead_id,
                'odoo_id' => $cd->odoo_id,
            ])->values()
        ]);

        return $this->cors(response()->json(['tours' => $tours, 'boats' => $boats]));
    }

    public function create(Request $request)
    {
        if ($this->isUnauthorized($request)) return $this->cors(response()->json(['error' => 'Unauthorized'], 401));

        $data = $this->sanitize($request->all());
        $item = new Closeddates();
        $item->fill($data);
        if (!$item->type) $item->type = 3;
        $item->save();

        return $this->cors(response()->json(['success' => true, 'id' => $item->id]));
    }

    public function update(Request $request, $id)
    {
        if ($this->isUnauthorized($request)) return $this->cors(response()->json(['error' => 'Unauthorized'], 401));

        if ($item = Closeddates::find($id)) {
            $item->fill($this->sanitize($request->all()));
            $item->save();
            return $this->cors(response()->json(['success' => true]));
        }

        return $this->cors(response()->json(['error' => 'Not found'], 404));
    }

    public function delete(Request $request, $id)
    {
        if ($this->isUnauthorized($request)) return $this->cors(response()->json(['error' => 'Unauthorized'], 401));

        if ($item = Closeddates::find($id)) {
            $item->delete();
            return $this->cors(response()->json(['success' => true]));
        }

        return $this->cors(response()->json(['error' => 'Not found'], 404));
    }

    protected function sanitize(array $data): array
    {
        foreach (['qtty', 'type', 'boat_id', 'lead_id', 'odoo_id'] as $int) {
            if (array_key_exists($int, $data) && $data[$int] === '') {
                $data[$int] = null;
            }
        }
        return $data;
    }

    protected function isUnauthorized(Request $request): bool
    {
        $cfg    = require __DIR__ . '/../odoo/services.config.php';
        $token  = $cfg['admin_token'] ?? null;
        if (!$token) return true;
        return $request->header('Authorization', '') !== 'Bearer ' . $token;
    }

    protected function cors($response)
    {
        return $response
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    }

    public function options()
    {
        return $this->cors(response('', 200));
    }

    public function closeTomorrow(Request $request)
    {
        $cfg     = require __DIR__ . '/../odoo/services.config.php';
        $cronKey = $cfg['cron_key'] ?? null;
        if (!$cronKey || $request->get('key') !== $cronKey) {
            return $this->cors(response()->json(['error' => 'Unauthorized'], 401));
        }

        $tomorrow = Carbon::tomorrow()->format('Y-m-d');
        $boats    = Boat::all();
        $count    = 0;

        foreach ($boats as $boat) {
            $alreadyClosed = Closeddates::where('boat_id', $boat->id)
                ->where('date', $tomorrow)
                ->where('type', 4)
                ->exists();

            if (!$alreadyClosed) {
                $item = new Closeddates();
                $item->boat_id = $boat->id;
                $item->date    = $tomorrow;
                $item->type    = 4;
                $item->lead_id = 0;
                $item->save();
                $count++;
            }
        }

        return $this->cors(response()->json([
            'success'  => true,
            'date'     => $tomorrow,
            'created'  => $count,
            'skipped'  => $boats->count() - $count,
        ]));
    }
}
