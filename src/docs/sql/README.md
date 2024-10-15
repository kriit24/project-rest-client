### SQLLite SQL

SELECT

```
object
.SQL()//to use sqlite local database 
.select()//this resets all previous objects
.join('address ON address_id = object_address_id')//join
.where('object_id', '>=', 1)//use where with operator
.when((address_search !== undefined && address_search.length), (q) => {

    q.where('address_address', 'LIKE', '%' + address_search + '%');
})
.order('object_id', 'DESC')
.group('object_parent_id')
.limit(2)
.fetchAll(async (rows) => {

    //console.log('');
    //console.log('OBJECT-1', Object.values(rows).length);
    //console.log('---', JSON.stringify(rows, null, 2));
    //console.log('---object_id---' + rows[0].object_id, rows[0].address);
    //console.log('');
});


object
.SQL()
.select()//this resets all previous objects
.where('object_id', 5000)//use where without operator
.fetch((row) => {

    console.log('OBJECT-5000');
    console.log(JSON.stringify(row, null, 2));
});

//column fetching
object
.SQL()
.select([
    "*", //retrieve all columns from object AND address
    "object.*", //retrieve all columns from object
    "object_id, object_name", //retrieve custom columns from object
    "address.address_id, address.address" //retrieve custom columns form address
])
.join('address ON address_id = object_address_id')//join
.whereRaw('object_address_id IS NOT NULL')
.fetchAll(resolve)

//each fetching - runs foreach row for u
//it is also with better performance
object
.SQL()
.select([
    "*", //retrieve all columns from object AND address
    "object.*", //retrieve all columns from object
    "object_id, object_name", //retrieve custom columns from object
    "address.address_id, address.address" //retrieve custom columns form address
])
.join('address ON address_id = object_address_id')//join
.whereRaw('object_address_id IS NOT NULL')
.fetchEach(resolve)



//PRE DEFINED MODEL METHOD

import ProjectRest from 'project-rest-client';
import config from "../config";

class Model extends ProjectRest.Model{

    fillable = [
        'id', 'value', 'intValue'
    ];

    constructor(wso) {

        super(wso, 'test', 'id');
    }
    
    //REQUIRED for pre defined
    SQL() {

        return super.SQL(['active']);
    }

    //CALL it test.SQL().select().active().fetchAll()
    active(){

        this.where('test.value', 'active');
        return this;
    }
}

let test = new Model(config.get.ws());

export default test;
                
```

INSERT

```
let insert = address
.SQL()
.insert({
    address_name: 'five thousand'
})
.sync()//sync to API, put after insert
.result();//get insert result

let insertID = insert.lastInsertRowId;

object
.SQL()
.insert({
    object_address_id: insertId,
    object_name: 'five thousand'
});
```

UPDATE

```
let update = object
.SQL()
.where('object_id', 5000)
.update({
    object_address_id: 5000,
    object_name: 'five thousand'
})
.sync()//sync to API, put after update
.result();//get update result
```


UPSERT - insert or update (unique id required)

```
object
.SQL()
.upsert(
//update, insert data
//on update it will update only this data
//on insert it will merge data and unique objects
{
    object_address_id: 5000,
    object_name: 'five thousand'
},
//unique id
{
    object_id: 5000,
}
)
.sync()//sync to API, put after upsert
.result();
```

DELETE

```
object
.SQL()
.where('object_id', 5000)
.delete()
.sync()//sync to API, put after delete
.result();
```
