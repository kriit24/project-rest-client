import Project from '../../index';


let Wso = new Project.WS.connect({
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
    //set data encryption hash key - AES-128-CBC
    hash_key: null,
    //offline post (insert/update) request cached data length
    cache_length: 1000,
});

export default Wso;
