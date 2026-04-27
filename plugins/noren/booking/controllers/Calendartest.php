<?php 
namespace Noren\Booking\Controllers;

use Backend\Classes\Controller;
use Noren\Booking\Models\Boat;
use Noren\Booking\Models\Tours;
use Noren\Booking\Models\CloseddatesTest as Closeddates;
use BackendMenu;
use Input;
use Log;
use Session;
use Carbon\Carbon;

class Calendartest extends Controller
{
    public $requiredPermissions = []; 

    public function __construct()
    {
        parent::__construct();
        BackendMenu::setContext('Noren.Booking', 'main-menu-item4', 'side-menu-item4');
    }

    public function index()
    {
      	$tours = Tours::all();
    
      	$this->vars['tours']=$tours;

    }

    public function onUpdate()
    {
        $startInput = Input::get('start');
        $endInput   = Input::get('end');
        $tour = Input::get("tour");
        

        // если переданы даты — сохраняем в сессию
        if ($startInput && $endInput) {
            Session::put('calendar_start', $startInput);
            Session::put('calendar_end', $endInput);
        }

        // берём из сессии (если не переданы явно)
        $startInput = $startInput ?: Session::get('calendar_start');
        $endInput   = $endInput   ?: Session::get('calendar_end');

        if (!$startInput || !$endInput) {
            return ['#list' => '<p class="m-3">Select dates interval</p>'];
        }

        //$start = Carbon::parse($startInput)->startOfDay();//;
        //$end   = Carbon::parse($endInput)->endOfDay();//;
        
$start = Carbon::parse($startInput, 'Asia/Makassar')->startOfDay();
$end   = Carbon::parse($endInput, 'Asia/Makassar')->endOfDay();


        // массив всех дат в диапазоне
        $dateArray = [];
        $cursor = $start->copy();
        while ($cursor->lte($end)) {
            $dateArray[] = $cursor->toDateString();
            $cursor->addDay();
        }

        // все лодки
if ($tour) {
	
    $tour= Tours::with('boat')->find($tour);
    $boats=$tour->boat;
} else {
    $boats = Boat::all();
}


        // бронирования
        $bookings = Closeddates::whereBetween('date', [$start, $end])
            ->get()
            ->groupBy('date')
            ->map(function($items) {
                return $items->groupBy('boat_id');
            });

        return [
            '#list' => $this->makePartial('list', [
                'boats'     => $boats,
                'dateArray' => $dateArray,
                'bookings'  => $bookings
            ])
        ];
    }

    public function onAdd()
    {
        $boatId = Input::get('id');
        $date   = Input::get('date'); // Y-m-d

        $booking = new Closeddates();
        $booking->boat_id = $boatId;
        
        $booking->date = $date;

        $booking->save();

        return $this->onUpdate(); // перерисуем список по диапазону из сессии
    }

    public function onRemove()
    {
        $id = Input::get('id');

        if ($booking = Closeddates::find($id)) {
            $booking->delete();
        }

        return $this->onUpdate(); // перерисуем список по диапазону из сессии
    }
}
