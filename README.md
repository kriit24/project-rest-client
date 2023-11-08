# PROJECT DB REST API CLIENT

## Installation

```
npm i project-rest-client
```

## Usage details view at docs/

### configuration  
create configuration file config.js

```
import Project_WS from "project-rest-client";


let Wso = new Project_WS.connect({
    //WSS host for LIVE watch, if not added then live watch not possible
    //wss_host: 'ws://80.235.7.34:6001',
    //fetch from REST API
    fetch: 'https://haldus.projectpartner.ee/wss.php/fetch',
    //post to REST API
    post: 'https://haldus.projectpartner.ee/wss.php/post_server',
    //delete to REST API
    delete: 'https://haldus.projectpartner.ee/wss.php/delete_server',
    //database schema
    channel: 'haldus_projectpartner_ee',
    //REST API auth user
    uuid: 'seeonlihtsaltkatsepikkusega30sona',
    //REST API auth token
    token: 'da01411f889747bfffaf503540c1b8daef8fd4d84c49aa94e0c96270a4d00a3da23de7488aa804248adb19b223b9f4209541f1c257b7502f4083c57f44253e47',
    //offline post (insert/update) request cached data length
    cache_length: 1000,
});

export default Wso;

```

### models  
create model file app/models/address.js

```
import Project_WS from "project-rest-client";
import Wso from "../config";

class Model extends Project_WS.model{

    constructor(wso) {

        super(wso, 'object', 'object_id');
        this.belongsTo('address', 'object_address_id', 'address_id');
    }
}

let object = new Model(Wso);

export default object;

```


### requests  
GET request

```
object
.select()//this resets all previous objects
.with('address')//join
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
```


POST request

```
object.save({
    object_id: 5000,//primary id is required
    object_address_id: 5000,
    object_name: 'five thousant'
});
```

DELETE request

```
object.delete(5000);//delete by object_id
```
