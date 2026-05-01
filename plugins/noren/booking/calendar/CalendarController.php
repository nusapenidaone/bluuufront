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

        $data = $request->all();
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
            $item->fill($request->all());
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

    protected function isUnauthorized(Request $request)
    {
        $key = $request->get('key');
        return $key !== 'e4f3b1a9c2d8e7f6a1b2c3d4e5f67890';
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
}
