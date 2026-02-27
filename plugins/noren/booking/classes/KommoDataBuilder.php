<?php namespace Noren\Booking\Classes;

use Noren\Booking\Models\Order;
use Noren\Booking\Models\Lead;
use Noren\Booking\Models\Extras;
use Noren\Booking\Models\Rates;
use Noren\Booking\Classes\KommoService;

use Log;

class KommoDataBuilder
{
    /**
     * @param Order $order
     * @return array
     */
    public static function createLead($id)
    {
        $order=Order::find($id);
        

        // Кастомные поля лида
        $leadCustomFields = [];
       

        $leadCustomFields[] = [
            'field_id' => 187740,
            'values' => [['value' => 'Bluuu.tours']],
        ];
        $leadCustomFields[] = [
            'field_id' => 670792,
            'values' => [['value' => $order->external_id]],
        ];
        
        


        
        //traveldate
        if (!empty($order->travel_date)) {
        	
		$travel_date = strtotime($order->travel_date)
		    + ($order->tours->types_id == 2 ? 3600 : 0);
        	
            $leadCustomFields[] = [
                'field_id' => 188172,
                'values' => [['value' => $travel_date]],
                //'values' => [['value' => strtotime($order->travel_date)]],
            ];
        }
        //adults
        if (!empty($order->adults)) {
            $leadCustomFields[] = [
                'field_id' => 674292,
                'values' => [['value' => (string)$order->adults]],
            ];
        }
        //kids
        if (!empty($order->kids)) {
            $leadCustomFields[] = [
                'field_id' => 674294,
                'values' => [['value' => (string)$order->kids]],
            ];
        }
        //children
        if (!empty($order->children)) {
            $leadCustomFields[] = [
                'field_id' => 683711,
                'values' => [['value' => (string)$order->children]],
            ];
        }
        
        //members
        if (!empty($order->members)) {
            $leadCustomFields[] = [
                'field_id' => 187664,
                'values' => [['value' => (string)$order->members]],
            ];
            
            
            if($order->tours->types_id==1){
                $leadCustomFields[] = [
                    'field_id' => 685461,
                    'values' => [['value' => (string)$order->members]],
                ];
            }
            
        }


        if (!empty($order->tours->amo_tour_name)) {
            $leadCustomFields[] = [
                'field_id' => 187666,
                'values' => [['value' => $order->tours->amo_tour_name]],
            ];
        }
        
        if (!empty($order->tours->amo_boat_name)) {
            $leadCustomFields[] = [
                'field_id' => 187672,
                'values' => [['value' => $order->tours->amo_boat_name]],
            ];
        }
        //abo odoo
        if (!empty($order->tours->amo_odoo_name)) {
            $leadCustomFields[] = [
                'field_id' => $order->tours->amo_odoo_id,
                'values' => [['value' => $order->tours->amo_odoo_name]],
            ];
        }
        
        
        //source
        if (!empty($order->tours->amo_source_name)) {
            $leadCustomFields[] = [
                'field_id' => $order->tours->amo_source_id,
                'values' => [['value' => $order->tours->amo_source_name]],
            ];
        }
        
        //transfer
   
        if(empty($order->transfer)){
            
                $leadCustomFields[] = [
                    'field_id' => 667032,
                    'values' => [['value' => '23-Transfer (No Transfer)']],
                ];
        }else{
            $leadCustomFields[] = [
                'field_id' => 667032,
                'values' => [['value' => $order->transfer->amo_name]],
            ];
            
            if($order->transfer->id==1){
                
                $leadCustomFields[] = [
                    'field_id' => 678331,
                    'values' => [['value' => $order->cars]],
                ];
                
            }
            if($order->transfer->id==2){
                $leadCustomFields[] = [
                    'field_id' => 678331,
                    'values' => [['value' => $order->cars]],
                ];
                
                $leadCustomFields[] = [
                    'field_id' => 678333,
                    'values' => [['value' => $order->cars]],
                ];
            }
        
        }
        


        
        if (!empty($order->pickup_address)) {
            $leadCustomFields[] = [
                'field_id' => 674288,
                'values' => [['value' => $order->pickup_address]],
            ];
        }
        
        if (!empty($order->pickup_address)) {
            $leadCustomFields[] = [
                'field_id' => 674290,
                'values' => [['value' => $order->dropoff_address]],
            ];
        } 
        
        
        
        if (!empty($order->cover->amo_id)) {
            
            $q=$order->cover->per_boat ? 1 : $order->members;
            $leadCustomFields[] = [
                'field_id' => $order->cover->amo_id,
                'values' => [['value' => $q]],
            ];
        }
        

        if (!empty($order->program->amo_name)) {
            $leadCustomFields[] = [
                'field_id' => 683555,
                'values' => [['value' => $order->program->amo_name]],
            ];
        }
        
        if (!empty($order->program->amo_extras_id)) {
            $leadCustomFields[] = [
                'field_id' => $order->program->amo_extras_id,
                'values' => [['value' => $order->cars]],
            ];
            

            $leadCustomFields[] = [
                'field_id' => 679279,
                'values' => [['value' => $order->cars]],
            ];
        }
        
        
        if (!empty($order->restaurant->amo_name)) {
            $leadCustomFields[] = [
                'field_id' => 679321,
                'values' => [['value' => $order->restaurant->amo_name]],
            ];
        }

        $discount=$order->discount ? $order->discount : 0;
        $leadCustomFields[] = [
            'field_id' => 685769,
            'values' => [['value' => $discount.'%']],
        ];
        
        
        if (!empty($order->deposite_summ)) {
            $leadCustomFields[] = [
                'field_id' => 414702,
                'values' => [['value' => $order->deposite_summ]],
            ];
            
        }
        
        if (!empty($order->deposite)) {
            
            if($order->deposite==50){
                $leadCustomFields[] = [
                    'field_id' => 670786,
                    'values' => [['value' => 'PAID DP']],
                ];
            }elseif($order->deposite==100){
                $leadCustomFields[] = [
                    'field_id' => 670786,
                    'values' => [['value' => 'PAID FULL']],
                ];
            }
            
        }
        
        

        if (!empty($order->method_id) and $order->order_type_id==1) {
            $leadCustomFields[] = [
                'field_id' => 664208,
                'values' => [['value' => $order->method->name]],
            ];
            
            
            if($order->method_id!=1){
                $usd_rate=Rates::find(2)->rate;
                $usd_summ=$usd_rate * $order->deposite_summ;
                
                $leadCustomFields[] = [
                    'field_id' => 683921,
                    'values' => [['value' => number_format($usd_summ, 2, '.', '')]],
                ];
                
            }
            
        }
        
        
        


        if (!empty($order->promocode)) {
            $leadCustomFields[] = [
                'field_id' => 692787,
                'values' => [['value' => $order->promocode]],
            ];
        }
        
        
        if (!empty($order->agent_name)) {
            $leadCustomFields[] = [
                'field_id' => 692717,
                'values' => [['value' => $order->agent_name]],
            ];
        }
        
        if (!empty($order->agent_fee)) {
            $leadCustomFields[] = [
                'field_id' => 692991,
                'values' => [['value' => $order->agent_fee.'%']],
            ];
        }
        
        
		$utmFieldMap = [
		    'utm_content'  => 110692,
		    'utm_medium'   => 110694,
		    'utm_campaign' => 110696,
		    'utm_source'   => 110698,
		    'utm_term'     => 110700,
		    'utm_referrer' => 110702,
		];
		
		// Проверяем, что массив $utm есть
		if (!empty($order->utm) && is_array($order->utm)) {
		    foreach ($utmFieldMap as $utmKey => $fieldId) {
		        if (!empty($order->utm[$utmKey])) {
		            $leadCustomFields[] = [
		                'field_id' => $fieldId,
		                'values'   => [['value' => $order->utm[$utmKey]]],
		            ];
		        }
		    }
		}
        
        

        if (!empty($order->tour_price)) {
            $boat_tour_price=$order->tour_price+$order->boat_price;
            if($order->tours->types_id==1){
                $total_price=$boat_tour_price/$order->members;
            }elseif($order->tours->types_id==2){
                $total_price=$boat_tour_price;
            }
            elseif($order->tours->types_id==3){
                $total_price=$boat_tour_price;
            }
            $leadCustomFields[] = [
                'field_id' => 679275,
                'values' => [['value' => $total_price]],
            ];
        }


        //extras
        if (!empty($order->extras) && is_array($order->extras)) {
            foreach ($order->extras as $extra) {
                if (!empty($extra['id']) && isset($extra['qty'])) {
  
                    $extraModel = Extras::find($extra['id']);
 
                    if ($extraModel && $extraModel->amo_id) {
                        $leadCustomFields[] = [
                            'field_id' => (int)$extraModel->amo_id,
                            'values' => [
                                ['value' => (int)$extra['qty']],
                            ],
                        ];
                    }
                }
            }
        }
        //comments
        if (!empty($order->requests)) {
            $leadCustomFields[] = [
                'field_id' => 683665,
                'values' => [['value' => $order->requests]],
            ];
        }
        
        // данные контакта
        $contactFields = [];

        if (!empty($order->email)) {
            $contactFields[] = [
                'field_code' => 'EMAIL',
                'values' => [['value' => $order->email]],
            ];
        }

        if (!empty($order->whatsapp)) {
            $contactFields[] = [
                'field_code' => 'PHONE',
                'values' => [['value' => $order->whatsapp]],
            ];
        }

        $contacts = [
            [
                'first_name' => $order->name ?: 'No Name',
                'custom_fields_values' => $contactFields,
            ]
        ];
        
        //
        $tag = $order->deposite == 0 ? 145665 : 179303;

        // Базовый массив лида
        $lead = [
            'name' => $order->name ?: 'Заказ без названия',
            'pipeline_id' => 9161956,
            'status_id' => $order->amo_lead_id ? 71217428 : 71217384,
        ];
        
        // Если лид новый — добавляем контакты и тег
        if (!$order->amo_lead_id) {
            $lead['_embedded'] = [
                'tags' => [['id' => $tag]],
                'contacts' => $contacts,
            ];
        }
        

        if (!empty($leadCustomFields)) {
            $lead['custom_fields_values'] = $leadCustomFields;
        }
        
  

        
        //если имеется amo_lead_id тогда обновлаем лид иначе создаем комплексный лид
        if($order->amo_lead_id){
            $response= KommoService::updateLead($order->amo_lead_id,$lead); 
  
            $leadData = KommoService::getLead($order->amo_lead_id);
            $contactId = $leadData['_embedded']['contacts'][0]['id'] ?? null;
            
            if($contactId){
                $contact = KommoService::updateContact($contactId, $contacts[0]);
            }
            if (!$order->amo_contact_id and $contactId) {
                $order->updateQuietly([
                    'amo_contact_id' => $contactId,
                ]);
            }

        }else{
            $response= KommoService::createComplexLead([$lead]);    
            
            //получаем id лида и конктакта
            $leadId = $response[0]['id'] ?? null;
            $contactId = $response[0]['_embedded']['contacts'][0]['id'] ?? null;
            
            //добавлаем id лида и контакта если не имеется
            if ($leadId) {
                $order->updateQuietly([
                    'amo_lead_id' => $leadId,
                    'amo_contact_id' => $contactId,
                ]);
            }

        }
        

        
        $newlead= new Lead;
        $newlead->order_id=$id;
        $newlead->body=[$response,$lead];
        $newlead->save();

    }
}
