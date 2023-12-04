### configuration
create configuration file

```
import ProjectRest from "project-rest-client";


let Wso = new ProjectRest.connect({
    //WSS host for LIVE watch, if not added then live watch not possible
    //wss_host: 'ws://80.235.7.34:6001',
    //fetch from REST API
    fetch: 'https://haldus.projectpartner.ee/wss.php/fetch',
    //post to REST API
    post: 'https://haldus.projectpartner.ee/wss.php/post_server',
    //delete to REST API
    delete: 'https://haldus.projectpartner.ee/wss.php/delete_server',
    //error to REST API
    error: 'https://haldus.projectpartner.ee/wss.php/error',
    //database schema
    channel: 'haldus_projectpartner_ee',
    //REST API auth user
    uuid: 'seeonlihtsaltkatsepikkusega30sona',
    //REST API auth token
    token: '',
    //set data encryption hash key - AES-128-CBC
    hash_key: '',
    //offline post (insert/update) request cached data length
    cache_length: 1000,
    //debug
    debug: __DEV__
});

export default Wso;

```
