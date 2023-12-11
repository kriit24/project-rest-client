### query
SELECT

```
object
.select()//this resets all previous objects
.use('address_join')//use pre defined REST query
.with('address')//join
.ative()//pre defined model function
.where('object_id', 1)
.where('object_id', '>=', 1)
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
.where('object_id', 5000)
.fetch((row) => {

    console.log('OBJECT-5000');
    console.log(JSON.stringify(row, null, 2));
});

//column fetching
object
.select([
    "*,", //retrieve all columns from object
    "object_id, object_name,", //retrieve custom columns from object
    "address.address_id, address.address" //retrieve address columns
])
.with('address')
.whereRaw('object_address_id IS NOT NULL')
.fetchAll(resolve)
                
```

INSERT

```
object.insert({
    object_address_id: 5000,
    object_name: 'five thousant'
});
```

SAVE

```
object.save({
    object_address_id: 5000,
    object_name: 'five thousant'
}, 5000);
```

DELETE

```
object.delete(5000);//delete by object_id
```
