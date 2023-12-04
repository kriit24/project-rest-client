<?php

namespace App\Pusher;

use App\Models\Mysql;
use Illuminate\Support\Facades\Config;

class MysqlPush
{
    public function __construct()
    {

    }

    public function trigger($payload, $request)
    {
        $db_model = config('database.model');
        $class = $db_model($payload['model']);

        $reflectionClass = new \ReflectionClass($class);
        $reflectionProperty = $reflectionClass->getProperty('table');
        $table = $reflectionProperty->getValue(new $class);

        if (!$table) return [];

        //pre($payload);

        $db = config('database.connections.' . $payload['db']);
        Config::set('database.connections.mysql_dynamic', $db);

        $reflectionProperty = $reflectionClass->getProperty('primaryKey');
        $primaryKey = $reflectionProperty->getValue(new $class);

        $reflectionProperty = $reflectionClass->getProperty('fillable');
        $fillable = $reflectionProperty->getValue(new $class);

        $dispatchesEvents = null;
        if ($reflectionClass->hasProperty('dispatchesEvents')) {

            $reflectionProperty = $reflectionClass->getProperty('dispatchesEvents');
            $dispatchesEvents = $reflectionProperty->getValue(new $class);
        }

        $data = $payload['message'];
        if (isset($data['_id']))
            unset($data['_id']);
        if (isset($data['updated_at']))
            unset($data['updated_at']);
        if (isset($data['trigger']))
            unset($data['trigger']);

        //pre($data);

        $main = new $class();
        $arrayColumns = [];
        foreach ($fillable as $col) {

            if (isset($data[$col]) || array_key_exists($col, $data))
                $arrayColumns[] = $col;
        }
        $values = $data;

        $bindings = (function () use ($fillable, $dispatchesEvents, $main, $primaryKey, &$arrayColumns, $values) {

            if ($dispatchesEvents) {

                if (!isset($values[$primaryKey]) && isset($dispatchesEvents['inserting'])) {

                    $dispatcher = $dispatchesEvents['inserting'];
                    new $dispatcher($values);

                    foreach ($fillable as $col) {

                        if ((isset($values[$col]) || array_key_exists($col, $values)) && !in_array($col, $arrayColumns))
                            $arrayColumns[] = $col;
                    }
                }
                if (isset($values[$primaryKey]) && isset($dispatchesEvents['updating'])) {

                    $dispatcher = $dispatchesEvents['updating'];
                    new $dispatcher($values);

                    foreach ($fillable as $col) {

                        if ((isset($values[$col]) || array_key_exists($col, $values)) && !in_array($col, $arrayColumns))
                            $arrayColumns[] = $col;
                    }
                }
            }

            $returnValues = [];
            if( !empty($values) ) {

                foreach ($arrayColumns as $col) {

                    if ($main->hasAttributeMutator($col)) {

                        $m = $main->setAttribute($col, $values[$col]);
                        $ms = $m->getAttributes();
                        $values[$col] = $ms[$col];
                    }

                    $val = $values[$col];
                    if ($val === null)
                        $returnValues[] = null;
                    else
                        $returnValues[] = $val;
                }
            }
            return $returnValues;

        })();

        $sql = "
            INSERT INTO `" . $table . "` (" . implode(',', $arrayColumns) . ")

            VALUES (" . implode(',', array_map(function () {
                return '?';
            }, $arrayColumns)) . ")" .

            " ON DUPLICATE KEY UPDATE " .

            implode(',', array_map(function ($col) {
                    return '`' . $col . '` = VALUES(`' . $col . '`)';
                }, $arrayColumns)
            )
            . " RETURNING " . $primaryKey . "  ";

        if (isset($payload['header']['debug'])) {

            die(pre(str_replace_array('?', array_map(function ($val) {
                return is_object($val) || is_array($val) ? "'" . print_r($val, true) . "'" : "'" . $val . "'";
            }, $bindings), $sql
            )));
        }

        if( !empty($arrayColumns) && !empty($bindings) ) {

            $d = Mysql::select($sql, $bindings);

            if ($dispatchesEvents) {

                if (isset($dispatchesEvents['inserted'])) {

                    $dispatcher = $dispatchesEvents['inserted'];
                    new $dispatcher($bindings, $d);
                }
                if (isset($dispatchesEvents['updated'])) {

                    $dispatcher = $dispatchesEvents['updated'];
                    new $dispatcher($bindings, $d);
                }
            }
        }

        if (empty($d)) {

            return [];
        }

        $data[$primaryKey] = $d[0]->$primaryKey;

        return array_merge($data, ['trigger' => 'upsert']);
    }
}
