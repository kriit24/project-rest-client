<?php

namespace app\Models\Events;

use App\Models\Mysql;

class TableRelation
{
    public function __construct($table, $table_primary_key, $bindings, $tableData)
    {
        if (isset($bindings['data_unique_id']) && !empty($tableData)) {

            //die(pre($this));

            foreach ($tableData as $v) {

                Mysql::table('table_relation')->insert([
                    'table_relation_table_name' => $table,
                    'table_relation_table_id' => $v->{$table_primary_key},
                    'table_relation_unique_id' => $bindings['data_unique_id'],
                ]);
            }
        }
    }

    public static function fetch($unique_id)
    {
        return Mysql::table('table_relation')->where('table_relation_unique_id', $unique_id)->orderBy("table_relation_id", "DESC")->first();
    }
}
