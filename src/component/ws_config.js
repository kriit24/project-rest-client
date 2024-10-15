import * as FileSystem from "expo-file-system";

class WS_config{

    static STORAGE_DIR = FileSystem.cacheDirectory + 'ws';
    static conf = {
        fetch: undefined,
        live: undefined,
        post: undefined,
        put: undefined,
        push: undefined,
        delete: undefined,
        error: undefined,
        channel: undefined,
        authorization: undefined,
        token: undefined,
        cache_length: 1000,
        hash_key: null,
        debug: false,
    };
    static ws = undefined;
    static syncIntervalId = undefined;
    static appStateSubscription_2 = undefined;
    static appStateSubscription_3 = undefined;
    static netinfoStateSubscription_2 = undefined;
    static appStateStat_2 = 'inactive';
    static appStateStat_3 = 'inactive';
    static netinfoState_2 = true;
    static cacheData = {};
    static ess = {};
    static db = undefined;
}

export default WS_config;
