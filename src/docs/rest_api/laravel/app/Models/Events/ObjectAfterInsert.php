<?php

declare(strict_types=1);

namespace App\Models\Events;

use App\Models\objectT;

class ObjectAfterInsert extends objectT
{
    public function __construct($bindings, $tableData)
    {
        new TableRelation($this->getTable(), $this->getKeyName(), $bindings, $tableData);
    }
}
