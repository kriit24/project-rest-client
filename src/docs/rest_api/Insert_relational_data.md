### INSERT RELATIONAL DATA

setup relational parent table  

```
//App\Models\objectT.php - set relation after inserted
protected $dispatchesEvents = [
    'inserted' => ObjectAfterInsert::class,
];

//App\Models\Event\ObjectAfterInsert.php - call relation

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

```

setup relational child table

```
//App\Models\address.php - set relation before insert
 protected $dispatchesEvents = [
    'inserting' => AddressBeforeInsert::class,
];

//App\Models\Events\AddressBeforeInsert.php - get relation id
declare(strict_types=1);

namespace App\Models\Events;

class AddressBeforeInsert
{
    public function __construct(&$bindings)
    {
        if (isset($bindings['table_relation_unique_id'])) {

            $relation = TableRelation::fetch($bindings['table_relation_unique_id']);
            if( !empty($relation) ) {
                
                //die(pre($relation));
                $bindings['image_table'] = $relation->table_relation_table_name;
                $bindings['image_table_id'] = $relation->table_relation_table_id;
            }
        }
    }
}

```

use it on react native app

```
let object_unique_id = object.insert({
    'object_name': 'this is object name',
});

address.insert({
    'table_relation_unique_id': object_unique_id,//by that unique id two tables are merged in laravel
    'address_name': 'this is address name',
});
```
