### live

```
//watch object changes
object
.select()//this resets all previous objects
.where('object_id', 5000)
.live((row) => {

    console.log('OBJECT-5000');
    console.log(row);
});

//watch all object changes
object
.select()//this resets all previous objects
.liveAll((rows) => {

    console.log(rows);
});            
```

#### live requests uses SELECT QUERYING  

learn more about  [querying](https://github.com/kriit24/project-rest-client/tree/master/src/docs/query)  
