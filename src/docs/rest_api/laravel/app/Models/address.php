<?php

namespace App\Models;

use App\Models\Events\AddressBeforeInsert;
use Illuminate\Database\Eloquent\Model;

class address extends Model
{
    protected $table = 'address';
    protected $primaryKey = 'address_id';

    protected $fillable = [
        'address_id',
        'address_full_address',
        'address_ads_oid',
        'address_parts',
        'address_country',
        'address_county',
        'address_city',
        'address_district',
        'address_street',
        'address_street_number',
        'address_house',
        'address_apartment',
        'address_postal_code',
        'address_latitude',
        'address_longitude',
        'address_updated_at',
    ];

    public $timestamps = false;

    protected $dispatchesEvents = [
        'inserting' => AddressBeforeInsert::class,
    ];
}
