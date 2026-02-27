<?php

namespace Noren\Booking\Routes;

use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Session;
use Carbon\Carbon;
use Log;
use Input;
use Redirect;
use Noren\Booking\Models\Boat;
use Noren\Booking\Models\Closeddates;
use Validator;

class WebhookController extends Controller
{
    public function getData(){
        $data=Input::all();

        
        if(isset($data['leads']['status'][0]['custom_fields'])){
            $fields=$data['leads']['status'][0]['custom_fields'];
            $status=$data['leads']['status'][0]['status_id'];
            $lead_id=$data['leads']['status'][0]['id'];
            
            if($status=='71217436'){
 			
               
                foreach ($fields as $field) {
    				switch ($field['id']) {
    				    case '187672':
    				        $boat = $field['values'][0]['value'];
    				        break;
    				    case '188172':
    				        $date = $field['values'][0];
    				        break;
    				    case '187664':
    				        $qtty = $field['values'][0]['value'];
    				        break;
    				    case '187666':
    				        $tour = $field['values'][0]['value'];
    				        break;
    				        
    				        
    				}
                }
                if(isset($boat)){
                	
					$type = in_array($tour, ['2-Shared Boat Tour', '3-Premium Shared Boat Tour']) ? 1 : 2;
					
                    $boat=Boat::where('amo_name',$boat)->first();
                    
                    Closeddates::where('lead_id',$lead_id)->delete();
                    
                    if(isset($boat) and isset($date)){
                    	
                        $available=new Closeddates;
                        $available->date=date('Y-m-d', $date+28800);
                        $available->type=$type;
                        $available->lead_id=$lead_id;
                        $available->boat_id=$boat->id;
                        $available->qtty=isset($qtty) ? $qtty : null ;
                        $available->save();
                    }
                }
            }elseif($status=='72882952' ){

                Closeddates::where('lead_id',$lead_id)->delete();
            }
            return response('ok', 200);
        }
        return Redirect::to('404');
    }
    
    
    public function closeCalendar(){
        
        if (Input::get('key') !== 'e4f3b1a9c2d8e7f6a1b2c3d4e5f67890') {
            return Response::json(['error' => 'Unauthorized'], 401);
        }

        $tomorrow = Carbon::tomorrow()->format('Y-m-d');
        $boats = Boat::all();
        foreach ($boats as $boat) {
            $closeddates = new Closeddates(['date' => $tomorrow,'lead_id'=>'0', 'type'=>4]);
            $boat->closeddates()->save($closeddates);
        }
        return "Dates added successfully for all boats.";
    }
    
    
    
    //get all boats closed dates manage.nusapenida.one
    public function getAllDates()
    {
        $start = Input::get('start'); // ожидается в формате Y-m-d
        $end   = Input::get('end');   // ожидается в формате Y-m-d
        $tomorrow = Carbon::tomorrow()->format('Y-m-d');
    
        // Приводим start и end к Carbon
        $startDate = $start ? Carbon::parse($start)->format('Y-m-d') : $tomorrow;
        $endDate   = $end   ? Carbon::parse($end)->format('Y-m-d')   : null;
    
        // Загружаем лодки с закрытыми датами в нужном диапазоне
        $boats = Boat::with(['closeddates' => function ($query) use ($startDate, $endDate) {
            $query->where('date', '>=', $startDate);
            if ($endDate) {
                $query->where('date', '<=', $endDate);
            }
        }])->get(['id', 'amo_name']); // выбираем только нужные поля лодок
    
        if ($boats->isEmpty()) {
            return $this->jsonResponseWithCors(['message' => 'No boats available in this date range.'], 404);
        }
    
        return $this->jsonResponseWithCors($boats);
    }
    
    public function createBoatStatus(){
        
        if (Input::get('key') !== 'e4f3b1a9c2d8e7f6a1b2c3d4e5f67890') {
            return Response::json(['error' => 'Unauthorized'], 401);
        }
        
        $date=Input::get("date");
        $boat_id=Input::get("boat_id");

        $available=new Closeddates;
        $available->date=$date;
 		$available->type=3;
        $available->boat_id=$boat_id;
        $available->save();

    }
    public function deleteBoatStatus($id){
        
        
        if (Input::get('key') !== 'e4f3b1a9c2d8e7f6a1b2c3d4e5f67890') {
            return Response::json(['error' => 'Unauthorized'], 401);
        }

        Closeddates::find($id)->delete();
        
    }


    /**
     * Создаём JSON-ответ с заголовками CORS
     */
    protected function jsonResponseWithCors($data, $status = 200)
    {
        $response = Response::json($data, $status);
        $response->header('Access-Control-Allow-Origin', '*');
        $response->header('Access-Control-Allow-Methods', 'GET');
        $response->header('Access-Control-Allow-Headers', 'Content-Type');
        return $response;
    }
    
    
    
}
