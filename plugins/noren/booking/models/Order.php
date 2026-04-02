<?php namespace Noren\Booking\Models;

use Model;
use Mail;
use Log;
use Noren\Booking\Classes\KommoDataBuilder;
use Noren\Booking\Classes\Ga4Service;

/**
 * Model
 */
class Order extends Model
{
    use \October\Rain\Database\Traits\Validation;


    /**
     * @var string table in the database used by the model.
     */
    public $table = 'noren_booking_order';

    /**
     * @var array rules for validation.
     */
    public $rules = [
    	
        'name'        => 'required',
        'email'       => 'required|email',
        'travel_date'  => 'required|date',
        'adults'      => 'required|integer|min:1',
        'kids'			=> 'required|numeric|min:0',
        'children'      => 'required|numeric|min:0',
        'tours_id'      => 'required|numeric|min:0',


    	
    ];
    protected $jsonable = ['extras','utm'];
    protected $fillable = ['amo_lead_id'];

    public $belongsTo = [
        'tours' => Tours::class,
        'program' => Program::class,
        'transfer' => Transfer::class,
        'restaurant' => Restaurant::class,
        'cover' => Cover::class,
        'status' => Status::class,
        'payment_status' => PaymentStatus::class,
        'email_status' => EmailStatus::class,
        'confirmation_status' => ConfirmationStatus::class,
        'order_type' => OrderType::class,
        'method' =>Method::class,
        'boat' => Boat::class,
        'route' => Route::class,
    ];
    
    public $hasMany =[
        'payment'=> Payment::class,
        'lead'=> Lead::class,
        'order_history'=> OrderHistory::class,
        
    ];
    
    public function beforeCreate()
    {
        $this->external_id = $this->generateCustomCode();
        $this->key= bin2hex(random_bytes(16));
    }
    
    
    protected function generateCustomCode(): string
    {
        $prefix = 'bluuu'; // твой префикс
        $timestamp = time(); // unix timestamp в секундах

        return $prefix . $timestamp;
    }
    
    //for filter yaml
    public function scopeFilterByTourTypes($query, $value)
    {
        $query->whereHas('tours', function($q) use ($value) {
            $q->whereIn('types_id', (array) $value);
        });
    }

	//send request to kommo
    public function afterCreate()
    {    
        if($this->status_id==4){
            $data= KommoDataBuilder::createLead($this->id);
        }elseif($this->status_id==1){
            $this->handleEmailOnCreated();
        }
    }
    
    
    //send order if status confirmed    
    public function afterUpdate()
    {
        if ($this->isDirty('status_id')) {
            if($this->status_id==2){
                $data = KommoDataBuilder::createLead($this->id);
                
                $this->handleEmailOnPaymentStatus();
                Ga4Service::sendPurchase($this);
            }elseif($this->status_id==4){
                $data= KommoDataBuilder::createLead($this->id);
                Ga4Service::sendPurchase($this);
            }
        }
    }
    
    protected function handleEmailOnPaymentStatus()
    {
            try {
                $vars = ['order' => $this];
    
                Mail::send('confirmed', $vars, function ($message) {
                    $message->to($this->email, $this->name);
                    $message->bcc('info@bluuu.tours');
                });
            
            } catch (\Exception $e) {
                Log::error("Email send error  #{$this->id}: " . $e->getMessage());
            }
    }

    protected function handleEmailOnCreated()
    {
            try {
                $vars = ['order' => $this];
    
                Mail::send('created', $vars, function ($message) {
                    $message->to('info@bluuu.tours');
                });
            
            } catch (\Exception $e) {
                Log::error("Email send error  #{$this->id}: " . $e->getMessage());
            }
    }






}
