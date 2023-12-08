<?php

declare(strict_types=1);

namespace App\Models\Events;

class AddressBeforeInsert
{
    public function __construct(&$bindings)
    {
        if (isset($bindings['table_relation_unique_id'])) {

            $relation = TableRelation::fetch($bindings['table_relation_unique_id']);
            //die(pre($relation));
            $bindings['image_table'] = $relation->table_relation_table_name;
            $bindings['image_table_id'] = $relation->table_relation_table_id;
        }
    }
}
