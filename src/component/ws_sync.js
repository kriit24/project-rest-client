import * as FileSystem from "expo-file-system";
import {AppState} from "react-native";
import WS_stmt from "./ws_stmt";
import WS_config from "./ws_config";
import NetInfo from "@react-native-community/netinfo";
import canJSON from "project-can-json";
import callback from "./callback";

class sync extends WS_stmt {

    cacheFile = null;

    constructor(table) {

        super();

        this.setTable(table);
        this.cacheFile = WS_config.STORAGE_DIR + '/' + this.ws.channel + '/ws_cache.json';

        (async () => {

            //if file does not exists then create
            let dirInfo = await FileSystem.getInfoAsync(this.cacheFile);
            if (!dirInfo.exists) {

                await FileSystem.writeAsStringAsync(this.cacheFile, JSON.stringify({}));
            }
        })();

        //re-sync data
        if (WS_config.syncIntervalId === undefined) {

            //send cache data
            WS_config.syncIntervalId = setInterval(() => {

                if (WS_config.cacheData[this.cacheFile] === undefined || !Object.values(WS_config.cacheData[this.cacheFile]).length) {

                    this.cacheSend();
                }
            }, 10000);

            //sync when appstate changed
            if (WS_config.appStateSubscription_2 !== undefined) WS_config.appStateSubscription_2.remove();
            WS_config.appStateSubscription_2 = AppState.addEventListener('change', nextAppState => {

                if (WS_config.appStateStat_2.match(/inactive|background/) && nextAppState === 'active') {

                    WS_config.appStateStat_2 = nextAppState;
                    reSync();
                    if (WS_config.cacheData[this.cacheFile] === undefined || !Object.values(WS_config.cacheData[this.cacheFile]).length) {

                        this.cacheSend();
                    }
                }
                WS_config.appStateStat_2 = nextAppState;
            });

            //sync when netstate changed
            if (WS_config.netinfoStateSubscription_2 !== undefined) WS_config.netinfoStateSubscription_2();
            WS_config.netinfoStateSubscription_2 = NetInfo.addEventListener(state => {

                let isConnected = (state.isInternetReachable !== undefined ? state.isInternetReachable : state.isConnected);
                if (isConnected === true && WS_config.netinfoState_2 === false) {

                    WS_config.netinfoState_2 = isConnected;
                    reSync();
                    if (WS_config.cacheData[this.cacheFile] === undefined || !Object.values(WS_config.cacheData[this.cacheFile]).length) {

                        this.cacheSend();
                    }
                }
                WS_config.netinfoState_2 = isConnected;
            });
        }
    }

    send(row) {

        callback(function (row) {

            this.ws
                //.offline()
                .setData(row)
                .send(row.event, row.model, row.data)
                //if everything is ok then do nothing
                .then((response) => {
                })
                //if something is wrong then store data
                .catch(async (error) => {

                    let tmp = row;
                    let date = new Date();

                    let cacheData = canJSON(await FileSystem.readAsStringAsync(this.cacheFile));
                    cacheData[date.getTime()] = tmp;
                    await FileSystem.writeAsStringAsync(this.cacheFile, JSON.stringify(cacheData));

                    if (Object.keys(cacheData).length >= WS_config.conf.cache_length) {

                        let cacheKeys = Object.keys(cacheData).slice(0, (Object.keys(cacheData).length - WS_config.conf.cache_length));
                        if (cacheKeys.length) {

                            cacheKeys.forEach((key) => {

                                delete cacheData[key];
                            });
                            await FileSystem.writeAsStringAsync(this.cacheFile, JSON.stringify(cacheData));
                        }
                    }
                });
        }, this, row);
    }

    reset() {

        WS_config.cacheData = {};
        FileSystem.writeAsStringAsync(this.cacheFile, JSON.stringify({}));
    }

    async cacheSend() {

        //await FileSystem.writeAsStringAsync(this.cacheFile, JSON.stringify({}));

        if (WS_config.cacheData[this.cacheFile] === undefined || !Object.values(WS_config.cacheData[this.cacheFile]).length) {

            let tmp = canJSON(await FileSystem.readAsStringAsync(this.cacheFile));
            WS_config.cacheData[this.cacheFile] = {};

            if (Object.keys(tmp).length) {

                Object.keys(tmp).forEach((key) => {

                    let row = tmp[key];
                    if (row !== undefined && row !== null) {

                        WS_config.cacheData[this.cacheFile][key] = row;
                    }
                });
            }
        }

        if (WS_config.cacheData[this.cacheFile] !== undefined && Object.values(WS_config.cacheData[this.cacheFile]).length) {

            //let row = WS_config.cacheData[this.cacheFile].shift();
            let key = Object.keys(WS_config.cacheData[this.cacheFile])[0];
            let row = WS_config.cacheData[this.cacheFile][key];

            /*
            console.log('');
            console.log('SEND-CACHE', key);
            console.log(row);
            console.log('LEFT-1', Object.values(WS_config.cacheData[this.cacheFile]).length);
            */

            this.ws
                .setData(row)
                .send(row.event, row.model, row.data)
                //if everything is ok
                .then(async (response) => {

                    delete WS_config.cacheData[this.cacheFile][key];
                    //console.log('LEFT-2', Object.values(WS_config.cacheData[this.cacheFile]).length);

                    let cacheData = canJSON(await FileSystem.readAsStringAsync(this.cacheFile));
                    delete cacheData[key];
                    //console.log('LEFT-3', Object.values(cacheData).length);
                    await FileSystem.writeAsStringAsync(this.cacheFile, JSON.stringify(cacheData));

                    setTimeout(() => {

                        this.cacheSend();
                    }, 1);
                })
                //if something is wrong
                .catch(async (error) => {

                    //console.log('LEFT-4', Object.values(WS_config.cacheData[this.cacheFile]).length);
                    //let`s wait regular 10 seconds to resend data
                    setTimeout(() => {

                        this.cacheSend();
                    }, 10000);
                });
        }
    }
}


export default sync;
