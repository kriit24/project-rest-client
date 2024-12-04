import * as FileSystem from "expo-file-system";
import {AppState} from "react-native";
import WS_stmt from "./ws_stmt";
import WS_config from "./ws_config";
import NetInfo from "@react-native-community/netinfo";
import canJSON from "project-can-json";
import callback from "./callback";
import ProjectRest from "project-rest-client";
import * as SQLite from "expo-sqlite";
import error from "project-rest-client/src/component/error";

class sync extends WS_stmt {

    static sqlite;

    constructor(table) {

        super(table);

        if (!sync.sqlite) {

            try {

                sync.sqlite = SQLite.openDatabaseSync('project_rest_client');

                let query = "CREATE TABLE IF NOT EXISTS data_sync (\n" +
                    "data_sync_id INTEGER PRIMARY KEY AUTOINCREMENT,\n" +
                    "data_sync_table TEXT DEFAULT NULL,\n" +
                    "data_sync_data TEXT DEFAULT NULL,\n" +
                    "data_sync_data_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n" +
                    ")";
                this.exec(query);
            } catch (e) {

                error({
                    'message': 'SQLITE SYNC CANNOT OPEN DB',
                    'error': e,
                });
            }
        }

        this.setTable(table);
        let reSync = () => {

            if (WS_config.syncIntervalId === undefined && WS_config.netinfoState_2 == true) {

                //send cache data
                WS_config.syncIntervalId = setInterval(() => {

                    this.cacheSend();
                    this.cacheReset();
                }, 10000);
            }
        };

        let reSyncStop = () => {

            if (WS_config.syncIntervalId !== undefined) {

                clearInterval(WS_config.syncIntervalId);
                WS_config.syncIntervalId = undefined;
            }
        };

        //re-sync data at start
        reSync();

        //sync when appstate changed
        if (WS_config.appStateSubscription_2 !== undefined) WS_config.appStateSubscription_2.remove();
        WS_config.appStateSubscription_2 = AppState.addEventListener('change', nextAppState => {

            //app state is changed
            reSync();
            WS_config.appStateStat_2 = nextAppState;
        });

        //sync when netstate changed
        if (WS_config.netinfoStateSubscription_2 !== undefined) WS_config.netinfoStateSubscription_2();
        WS_config.netinfoStateSubscription_2 = NetInfo.addEventListener(state => {

            WS_config.netinfoState_2 = (state.isInternetReachable !== undefined && state.isInternetReachable ? state.isInternetReachable : state.isConnected);
            if (WS_config.netinfoState_2 === true) {

                reSync();
            } else {

                reSyncStop();
            }
        });
    }

    exec(query, params, callback = undefined) {

        /*
        console.log('S1');
        console.log(new Date());
        console.log(query);
        console.log("\n");
        */

        let statement, result = null;

        try {

            statement = sync.sqlite.prepareSync(query);
            result = statement.executeSync(params !== undefined ? params : null);
            if (callback !== undefined) callback(result);
        } catch (e) {

            error({
                'message': 'SQLITE SYNC ERROR',
                'query': query,
                'error': e,
            });
        } finally {

            statement.finalizeSync();
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
                .catch((error) => {

                    let query = "INSERT INTO `data_sync` (data_sync_table, data_sync_data) " +
                        "VALUES " +
                        "($insert_data_sync_table, $insert_data_sync_data)";
                    let params = {'$insert_data_sync_table': this.table, '$insert_data_sync_data': JSON.stringify(row)};
                    this.exec(query, params);
                });
        }, this, row);
    }

    reset() {

        this.exec("DELETE FROM data_sync WHERE 1 = 1");
    }

    cacheSend() {

        let query = "SELECT * FROM `data_sync` " +
            "ORDER BY data_sync_id ASC " +
            "LIMIT 1 ";
        let params = {};

        let row = {};
        this.exec(query, params, (result) => row = result.getFirstSync());

        if (row && Object.keys(row).length) {

            /*
            console.log('---CACHE SEND---');
            console.log(row);
            */

            let data = JSON.parse(row.data_sync_data);

            callback(function (data) {

                this.ws
                    .setData(data)
                    .send(data.event, data.model, data.data)
                    //if everything is ok
                    .then((response) => {

                        this.exec("DELETE FROM data_sync WHERE data_sync_id = $data_sync_id", {'$data_sync_id': row.data_sync_id});
                    })
                    //if something is wrong
                    .catch((error) => {
                    });
            }, this, data);
        }
    }

    cacheReset() {

        let query = "SELECT COUNT(1) AS data_sync_count FROM `data_sync` ";
        let params = {};

        let row = {};
        this.exec(query, params, (result) => row = result.getFirstSync());

        if (row && Object.keys(row) && row.data_sync_count >= WS_config.cache_length) {

            this.exec("DELETE FROM data_sync ORDER BY data_sync_id ASC LIMIT 1");
        }
    }
}


export default sync;
