### query
SELECT

```
object
.select()//this resets all previous objects
.use('address_join')//use pre defined REST query
.with('address')//join
.ative()//pre defined model function
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
.select()//this resets all previous objects
.where('object_id', 5000)//use where without operator
.fetch((row) => {

    console.log('OBJECT-5000');
    console.log(JSON.stringify(row, null, 2));
});

//column fetching
object
.select([
    "*", //retrieve all columns from object AND address
    "object.*", //retrieve all columns from object
    "object_id, object_name", //retrieve custom columns from object
    "address.address_id, address.address" //retrieve custom columns form address
])
.with('address')
.whereRaw('object_address_id IS NOT NULL')
.fetchAll(resolve)
                
```

WHERE

```
//normal where statement
.where('object_id', '=', 1)

//without operator
.where('object_id', 1)

//where in
.whereIn('object_id', [1])

//where not in
.whereNotIn('object_id', [1])

//where raw
.whereRaw("object_id IN(1)")
```

INSERT

```
let insertId = address.insert({
    address_name: 'five thousand'
});

object.insert({
    table_relation_unique_id: insertId,//this works only with "project-rest-server" library
    object_name: 'five thousand'
});
```

UPDATE

```
object.update({
    object_address_id: 5000,
    object_name: 'five thousand'
}, 5000/*primary id*/);

object.update({
    object_address_id: 5000,
    object_name: 'five thousand'
}, {'object_id': 5000, 'object_address_id': 5000});

object.where({'object_id': 5000}).update({
    object_address_id: 5000,
    object_name: 'five thousand'
});
```


UPSERT - insert or update (unique id required)

```
object.upsert(
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
);
```

DELETE

```
object.delete(5000);//delete by object_id
```
