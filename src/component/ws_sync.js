import * as FileSystem from "expo-file-system";
import {AppState} from "react-native";
import WS_stmt from "./ws_stmt";
import WS_fetchdata from "./ws_fetchdata";
import WS_config from "./ws_config";
import NetInfo from "@react-native-community/netinfo";
import canJSON from "project-can-json";

class sync extends WS_stmt {

    cacheFile = null;

    constructor(table, primaryKey) {

        super();

        this.setTable(table);
        this.setPrimaryKey(primaryKey);
        this.cacheFile = WS_config.STORAGE_DIR + '/' + this.ws.channel + '/ws_cache.json';
        WS_config.sync[table] = {table: table, primaryKey: primaryKey};

        let reSync = () => {

            Object.values(WS_config.sync).forEach((sync_table) => {

                new sync(sync_table.table, sync_table.primaryKey)
                    .sync();
            });
            this.cacheSend();
        };

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
                    this.cacheSend();
                }
                WS_config.appStateStat_2 = nextAppState;
            });

            console.log('netinfo');
            //sync when netstate changed
            if (WS_config.netinfoStateSubscription_2 !== undefined) WS_config.netinfoStateSubscription_2();
            WS_config.netinfoStateSubscription_2 = NetInfo.addEventListener(state => {

                console.log(state);

                let isConnected = (state.isInternetReachable !== undefined ? state.isInternetReachable : state.isConnected);
                if (isConnected === true && WS_config.netinfoState_2 === false) {

                    WS_config.netinfoState_2 = isConnected;
                    reSync();
                    this.cacheSend();
                }
                WS_config.netinfoState_2 = isConnected;
            });
        }
    }

    sync() {

        //console.log('---SYNC---', this.ws.channel + '@' + this.table);

        this
            .fileGetContent(this.ws.channel, this.table)
            .then((modelData) => {

                let updated_at = this.ws.getUpdatedAt(modelData, 'ASC');
                let {join, where} = this.getStmt();
                this.resetStmt();

                if (updated_at) {

                    this.ws
                        .setStmt(join, where)
                        .where('updated_at', '>', updated_at)
                        .order("updated_at", "desc")
                        //.debug()
                        .fetch(this.table)
                        .then((data) => {

                            //console.log('SYNC-1 "' + this.table + '"', Object.values(data.data).length);
                            this.syncData(data.data);
                        })
                        .catch(() => {
                        });
                } else {

                    this.ws
                        .setStmt(join, where)
                        .order("updated_at", "desc")
                        //.debug()
                        .fetch(this.table)
                        .then((data) => {

                            //console.log('SYNC-2 "' + this.table + '"', Object.values(data.data).length);
                            this.syncData(data.data);
                        })
                        .catch(() => {
                        });
                }
            });
    }

    syncData(rows) {

        if (rows.length) {

            this
                .fileGetContent(this.ws.channel, this.table)
                .then((modelData) => {

                    let primaryKey = this.primaryKey;
                    //console.log('---SYNC-TABLE-' + this.table, rows.length);

                    rows.forEach((row) => {

                        if (this.stmtDebug) {

                            console.log('SYNC-TABLE-' + this.table, row);
                            console.log('SYNC-TABLE-' + this.table, JSON.stringify(row, null, 2));
                            console.log('SYNC-TABLE-' + this.table, row.trigger + '----' + primaryKey + '-----' + row[primaryKey]);
                        }

                        if ((row.trigger !== undefined && ['insert', 'update', 'upsert', 'fetch'].indexOf(row.trigger) !== -1) || row.trigger === undefined) {

                            modelData = new WS_fetchdata(this.table, this.primaryKey)
                                .mergeData(modelData, row);
                        }
                        if (row.trigger !== undefined && ['delete'].indexOf(row.trigger) !== -1) {

                            if (row[primaryKey] !== undefined && modelData[row[primaryKey]] !== undefined) {

                                delete modelData[row[primaryKey]];
                            }
                        }
                    });

                    FileSystem.writeAsStringAsync(this.file(this.ws.channel, this.table), JSON.stringify(modelData));
                });
        }
    }

    listen() {

        this.ws.listen(this.table, (e, table) => {

            this.syncData([e]);
        });
    }

    send(row) {

        this.ws
            //.offline()
            .setData(row)
            .SEND(row.event, row.model, row.data)
            //if everything is ok then do nothing
            .then((response) => {

                if (this.stmtDebug) {

                    console.log('');
                    console.log('RESPONSE "' + response.status + '"', response);
                    console.log('');
                }
            })
            //if something is wrong then store data
            .catch(async (error) => {

                let tmp = this.ws.getData();

                if (this.stmtDebug) {

                    console.log('');
                    console.log('RESPONSE "ERROR"', error);
                    console.log(tmp);
                    console.log('');
                }

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
                //.offline()
                .setData(row)
                .SEND(row.event, row.model, row.data)
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