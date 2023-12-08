<?php

namespace App\Models\Events;

use Illuminate\Support\Facades\DB;

class TableRelation
{
    public function __construct($table, $table_primary_key, $bindings, $tableData)
    {
        if (isset($bindings['data_unique_id']) && !empty($tableData)) {

            //die(pre($this));

            foreach ($tableData as $v) {

                DB::table('table_relation')->insert([
                    'table_relation_table_name' => $table,
                    'table_relation_table_id' => $v->{$table_primary_key},
                    'table_relation_unique_id' => $bindings['data_unique_id'],
                ]);
            }
        }
    }
}
