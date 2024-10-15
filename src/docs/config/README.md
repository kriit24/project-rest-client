### configuration
create configuration file

```
import ProjectRest from "project-rest-client";


let Wso = new ProjectRest.config({
    //fetch from REST API
    fetch: 'https://laravel.api.com/api/fetch',
    //live from REST API
    live: 'https://laravel.api.com/api/live',
    //post to REST API
    post: 'https://laravel.api.com/api/post',
    //put to REST API
    put: 'https://laravel.api.com/api/put',
    //put to REST API
    push: 'https://laravel.api.com/api/push',
    //delete to REST API
    delete: 'https://laravel.api.com/api/delete',
    //error to REST API
    error: 'https://laravel.api.com/api/error',
    //database schema
    channel: channel,
    //REST API auth user
    uuid: config.get.uuid(),
    //REST API auth token
    token: config.get.token(),
    //set data encryption hash key - AES-128-CBC
    hash_key: config.get.mac_key(),
    //offline post (insert/update) request cached data length
    cache_length: 1000,
    //debug
    debug: __DEV__
});

ProjectRest.DB.init(channel, async () => {

    await ProjectRest.DB.query(
        "CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY NOT NULL, value TEXT NOT NULL, intValue INTEGER);"
    );
});

export default Wso;

```
