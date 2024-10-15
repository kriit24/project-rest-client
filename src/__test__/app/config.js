import ProjectRest from '../../index';


let Wso = new ProjectRest.config({
    //live from REST API
    live: 'https://haldus.projectpartner.ee/wss.php/live',
    //fetch from REST API
    fetch: 'https://haldus.projectpartner.ee/wss.php/fetch',
    //post to REST API
    post: 'https://haldus.projectpartner.ee/wss.php/post_server',
    //put to REST API
    put: 'https://haldus.projectpartner.ee/wss.php/put_server',
    //push to REST API
    push: 'https://haldus.projectpartner.ee/wss.php/push_server',
    //delete to REST API
    delete: 'https://haldus.projectpartner.ee/wss.php/delete_server',
    //error to REST API
    error: 'https://haldus.projectpartner.ee/wss.php/error',
    //database schema
    channel: 'haldus_projectpartner_ee',
    //REST API auth token for live
    token: 'da01411f889747bfffaf503540c1b8daef8fd4d84c49aa94e0c96270a4d00a3da23de7488aa804248adb19b223b9f4209541f1c257b7502f4083c57f44253e47',
    //REST API auth token
    authorization: 'Bearer ' + 'da01411f889747bfffaf503540c1b8daef8fd4d84c49aa94e0c96270a4d00a3da23de7488aa804248adb19b223b9f4209541f1c257b7502f4083c57f44253e47',
    //set data encryption hash key - AES-128-CBC - if hash key is null, then no mac will be presented
    hash_key: null,
    //offline post (insert/update) request cached data length
    cache_length: 1000,

    debug: false
});
/*
ProjectRest.DB.init('haldus_projectpartner_ee', async () => {

    await ProjectRest.DB.query(
        "CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY NOT NULL, value TEXT NOT NULL, intValue INTEGER);"
    );
});
*/

export default Wso;
