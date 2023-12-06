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

    //regular join
    public function address()
    {
        return $this->belongsTo(address::class, 'object_address_id', 'address_id', null);
    }

    //use query
    public function address_join()
    {
        $this->select($this->fillable)
            ->join("address", "address_id", "=", "object_address_id");
        return $this;
    }
}
