### live

```
//watch one object changes
object
.select()//this resets all previous objects
.where('object_id', 5000)
.live((row) => {

    console.log('OBJECT-5000');
    console.log(JSON.stringify(row, null, 2));
});

//watch all object changes
let object_rows = [];
object
.select()//this resets all previous objects
.live((rows) => {

    console.log('OBJECT-5000');
    console.log(JSON.stringify(rows, null, 2));
    
    //watch only updates
    object_rows = message.merge(object_rows, rows, true);
    console.log('OBJECT-UPDATES');
    console.log(JSON.stringify(object_rows, null, 2));
});              
```

#### live requests uses SELECT QUERYING  

learn more about  [querying](https://github.com/kriit24/project-rest-client/tree/master/src/docs/query)  
