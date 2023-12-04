<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class objectT extends Model
{
    protected $table = 'object';
    protected $primaryKey = 'object_id';
    protected $fillable = [
        'object_id',
        'object_client_company_id',
        'object_address_id',
        'object_name',
        'object_key_name',
        'object_short_name',
        'object_description',
        'object_is_stock',
        'object_is_main_stock',
        'object_is_base',
        'object_is_office',
        'object_latitude',
        'object_longitude',
        'object_radius',
        'object_time_travel_radius',
        'object_width',
        'object_length',
        'object_entrance_north',
        'object_entrance_north_name',
        'object_entrance_north_in_out',
        'object_entrance_south',
        'object_entrance_south_name',
        'object_entrance_south_in_out',
        'object_entrance_east',
        'object_entrance_east_name',
        'object_entrance_east_in_out',
        'object_entrance_west',
        'object_entrance_west_name',
        'object_entrance_west_in_out',
        'object_is_deleted',
        'object_is_hidden',
        'object_created_by',
        'object_created_at',
        'object_updated_at',
    ];

    public $timestamps = false;
    protected function objectKeyName(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => strtolower(str_replace([' ', ',', '.'], '', $value)),
            set: fn ($value) => strtolower(str_replace([' ', ',', '.'], '', $value)),
        );
    }

    public function address()
    {
        return $this->belongsTo(address::class, 'object_address_id', 'address_id', null);
    }
}
