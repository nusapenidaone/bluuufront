<?php namespace Noren\Booking\Models;

use Model;
use Mail;
use Log;
use App;
use Noren\Booking\Classes\KommoDataBuilder;
use Noren\Booking\Classes\Ga4Service;
use Noren\Booking\Odoo\OdooService;

class Order extends Model
{
    use \October\Rain\Database\Traits\Validation;

    public $table = 'noren_booking_order';

    public $rules = [
        'name'        => 'required',
        'email'       => 'required|email',
        'travel_date' => 'required|date',
        'adults'      => 'required|integer|min:1',
        'kids'        => 'required|numeric|min:0',
        'children'    => 'required|numeric|min:0',
        'tours_id'    => 'required|numeric|min:0',
    ];

    protected $jsonable = ['extras','utm'];
    protected $fillable = ['amo_lead_id','odoo_id'];

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
        'method' => Method::class,
        'boat' => Boat::class,
        'route' => Route::class,
        'source' => Source::class,
    ];

    public $hasMany = [
        'payment'=> Payment::class,
        'lead'=> Lead::class,
        'order_history'=> OrderHistory::class,
    ];

    // =========================
    // CREATE
    // =========================
    public function beforeCreate()
    {
        $this->external_id = $this->generateCustomCode();
        $this->key = bin2hex(random_bytes(16));
    }

    protected function generateCustomCode(): string
    {
        return 'bluuu' . time();
    }

    public function scopeFilterByTourTypes($query, $value)
    {
        $query->whereHas('tours', function($q) use ($value) {
            $q->whereIn('types_id', (array) $value);
        });
    }

    // =========================
    // AFTER CREATE
    // =========================
    public function afterCreate()
    {
        $order = $this;

        if ($this->status_id == 4) {

            App::after(function () use ($order) {
                KommoDataBuilder::createLead($order->id);
            });

        } elseif ($this->status_id == 1) {

            $this->sendEmailAsyncSimple('created', 'info@bluuu.tours');

        }
    }

    // =========================
    // AFTER UPDATE
    // =========================
    public function afterUpdate()
    {
        if (!$this->isDirty('status_id')) {
            return;
        }

        $order = $this;

        // ✅ статус confirm (оплата)
        if ($this->status_id == 2) {

            App::after(function () use ($order) {

                try {
                    static::dispatchLead($order);
                    //KommoDataBuilder::createLead($order->id);
                    Ga4Service::sendPurchase($order);
                } catch (\Exception $e) {
                    Log::error("AfterUpdate error #{$order->id}: " . $e->getMessage());
                }

            });

            // 📩 письмо клиенту
            $this->sendEmailAsyncSimple('confirmed', 'info@bluuu.tours', $this->name);
            $this->sendEmailAsyncSimple('confirmed', $this->email, $this->name);
        }

        // ✅ статус 4
        elseif ($this->status_id == 4) {

            App::after(function () use ($order) {

                try {
                    //KommoDataBuilder::createLead($order->id);
                    static::dispatchLead($order);
                    Ga4Service::sendPurchase($order);
                } catch (\Exception $e) {
                    Log::error("Status 4 error #{$order->id}: " . $e->getMessage());
                }

            });
        }
    }


    // =========================
    // LEAD ROUTING
    // =========================
    protected static function dispatchLead(Order $order): void
    {
        if ($order->source_id == 1) {
            $result = OdooService::createLead($order);
            $order->odoo_id = $result['order_id'];
            $order->save();
        } else {
            KommoDataBuilder::createLead($order->id);
        }
    }



    // =========================
    // UNIVERSAL EMAIL METHOD
    // =========================
    protected function sendEmailAsyncSimple(string $template, $to, $name = null)
    {
        $order = $this->fresh();

        App::after(function () use ($order, $template, $to, $name) {

            try {
                Mail::send($template, ['order' => $order], function ($message) use ($to, $name) {
                    $message->to($to, $name);
                });

            } catch (\Exception $e) {
                Log::error("Email send error #{$order->id}: " . $e->getMessage());
            }

        });
    }
}