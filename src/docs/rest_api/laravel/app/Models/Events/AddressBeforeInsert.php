<?php

declare(strict_types=1);

namespace App\Models\Events;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AddressBeforeInsert
{
    public function __construct(&$bindings)
    {
        if (isset($bindings['table_relation_unique_id'])) {

            $relation = DB::table('table_relation')->where('table_relation_unique_id', $bindings['table_relation_unique_id'])->first();
            //die(pre($relation));
            $bindings['image_table'] = $relation->table_relation_table_name;
            $bindings['image_table_id'] = $relation->table_relation_table_id;
        }
    }
}
