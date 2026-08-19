<?php
namespace Noren\Booking\Updates;

use Db;
use October\Rain\Database\Updates\Migration;

class SeedMethodDoku extends Migration
{
    public function up()
    {
        if (!Db::table('noren_booking_method')->where('id', 3)->exists()) {
            Db::table('noren_booking_method')->insert(['id' => 3, 'name' => 'DOKU']);
        }
    }

    public function down()
    {
        Db::table('noren_booking_method')->where('id', 3)->delete();
    }
}
