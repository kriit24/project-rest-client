import * as FileSystem from "expo-file-system";

class WS_config{

    static STORAGE_DIR = FileSystem.cacheDirectory + 'ws';
    static conf = {
        wss_host: undefined,
        fetch: undefined,
        post: undefined,
        delete: undefined,
        error: undefined,
        channel: undefined,
        uuid: undefined,
        token: undefined,
        cache_length: 1000,
        hash_key: null,
        debug: false,
    };
    static host = undefined;
    static ws = undefined;
    static conn = undefined;
    static connIntervalId = undefined;
    static syncIntervalId = undefined;
    static appStateSubscription = undefined;
    static appStateSubscription_2 = undefined;
    static netinfoStateSubscription = undefined;
    static netinfoStateSubscription_2 = undefined;
    static connPingPong = null;
    static appStateState = 'inactive';
    static appStateStat_2 = 'inactive';
    static netinfoState = true;
    static netinfoState_2 = true;
    static sync = {};
    static cacheData = {};
}

export default WS_config;
