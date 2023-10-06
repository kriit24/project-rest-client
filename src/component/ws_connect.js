import {AppState, DeviceEventEmitter} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import WS_stmt from "./ws_stmt";
import WS_config from "./ws_config";
import canJSON from 'project-can-json';
import Ws_crypto from "./ws_crypto";

class WS_connect extends WS_stmt {

    channel = undefined;

    constructor(conf) {

        super();

        this.setConf(conf);
        this.channel = conf.channel;

        if (this.conf.wss_host) {

            let connHost = this.conf.wss_host + '/' + this.conf.channel + '/?uuid=' + this.conf.uuid + '&token=' + this.conf.token;

            //reconnect
            if (WS_config.connIntervalId === undefined) {

                WS_config.connIntervalId = setInterval(() => {

                    let d = new Date();

                    //console.log('INTERVAL@' + d.toJSON(), WS_config.conn.readyState);

                    WS_config.connPingPong = setTimeout(() => {

                        //console.log('connection is dead');
                        clearTimeout(WS_config.connPingPong);
                        this.reconnect(this.conf);
                    }, 25000);

                    this.listen('pong', (e) => {

                        clearTimeout(WS_config.connPingPong);
                    });
                    WS_config.conn.send(JSON.stringify({'event': 'ping', 'message': {}}));

                }, 30000);
            }

            //reconnect when appstate changed
            if (WS_config.appStateSubscription !== undefined) WS_config.appStateSubscription.remove();
            WS_config.appStateSubscription = AppState.addEventListener('change', nextAppState => {

                if (WS_config.appStateState.match(/inactive|background/) && nextAppState === 'active') {

                    WS_config.appStateState = nextAppState;
                    this.reconnect(this.conf);
                }
                WS_config.appStateState = nextAppState;
            });

            //reconnect when netstate changed
            //if (WS_config.netinfoStateSubscription === undefined) {

            if (WS_config.netinfoStateSubscription !== undefined) WS_config.netinfoStateSubscription();
            WS_config.netinfoStateSubscription = NetInfo.addEventListener(state => {

                //console.log('NETINFO', state);
                let isConnected = state.isInternetReachable !== undefined ? state.isInternetReachable : state.isConnected;
                if (isConnected === true && WS_config.netinfoState === false) {

                    WS_config.netinfoState = isConnected;
                    this.reconnect(this.conf);
                }
                if ((isConnected) === false && WS_config.netinfoState === true) {

                    WS_config.netinfoState = isConnected;
                    this.kill();
                }
                WS_config.netinfoState = isConnected;
            });
            //}

            if (WS_config.conn === undefined || WS_config.conn.readyState !== WebSocket.OPEN) {

                //connect
                WS_config.conn = new WebSocket(connHost);

                //onopen
                WS_config.conn.onopen = (e) => {
                };

                //onmessage
                WS_config.conn.onmessage = (e) => {

                    let data = JSON.parse(e.data);
                    /*
                    console.log('');
                    console.log('--------------MESSAGE----------------');
                    console.log(e.data);
                    console.log('-------------------------------------');
                    console.log('');
                    */

                    if (data.event !== undefined) {

                        DeviceEventEmitter.emit(data.event, data);
                    }
                };

                //onerror
                WS_config.conn.onerror = (e) => {

                    //console.log('error');
                };

                //onclose
                WS_config.conn.onclose = (e) => {

                    //console.log('close');
                };
            }
        }
    }

    reconnect(conf) {

        this.kill();
        this.constructor(conf);
    }

    kill() {

        if (WS_config.conn !== undefined) WS_config.conn.close();
        if (WS_config.connIntervalId !== undefined) clearInterval(WS_config.connIntervalId);
        if (WS_config.syncIntervalId !== undefined) clearInterval(WS_config.syncIntervalId);
        WS_config.connIntervalId = undefined;
        WS_config.syncIntervalId = undefined;
        WS_config.conn = undefined;
    }


    listen(table, callback) {

        DeviceEventEmitter.removeAllListeners(table);
        DeviceEventEmitter.addListener(table, (e) => {

            callback(e.message, e.event);
        });
    }

    fetch(table) {

        return new Promise((resolve, reject) => {

            //console.log('STMT-----' + table + '-----------', this.getStmt());
            let url = this.conf['fetch'];

            if (url !== undefined) {

                let {join, where, limit, order} = this.getStmt();
                let offline = this.stmtOffline;
                let debug = this.stmtDebug;

                this.resetStmt();

                if (offline) {

                    reject({});
                }

                NetInfo.fetch().then((state) => {

                    let isConnected = (state.isInternetReachable !== undefined ? state.isInternetReachable : state.isConnected);
                    if (isConnected) {

                        if (debug) {

                            console.log('');
                            console.log('----------WS-FETCH----------');
                            console.log(this.conf.fetch + '/' + this.conf.channel + '/' + table);
                            console.log(JSON.stringify({
                                'join': join.length ? join : null,
                                'where': where.length ? where : null,
                                'order': order.length ? order : null,
                                'limit': limit.length && limit[0] !== undefined ? limit[0] : null,
                                'offset': limit.length && limit[1] !== undefined ? limit[1] : null,
                            }));
                            console.log('');
                        }

                        let body = {
                            'join': join.length ? join : null,
                            'where': where.length ? where : null,
                            'order': order.length ? order : null,
                            'limit': limit.length && limit[0] !== undefined ? limit[0] : null,
                            'offset': limit.length && limit[1] !== undefined ? limit[1] : null,
                        };

                        let mac = null;
                        if (WS_config.conf.hash_key)
                            mac = Ws_crypto.sign(body);

                        fetch(url + '/' + this.conf.channel + '/' + table, {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'uuid': this.conf.uuid,
                                'token': this.conf.token,
                                'mac': mac !== null ? mac.mac : null,
                            },
                            body: JSON.stringify(body),
                        })
                            .then((response) => response.text())
                            .then((response) => {

                                canJSON(response, (json) => {

                                    resolve(json);
                                }, () => {

                                    reject({});
                                });
                            })
                            .catch((error) => {

                                reject({});
                            });
                    } else {

                        reject({});
                    }
                });
            }
        });
    }

    send(event, table, json) {

        return new Promise((resolve, reject) => {

            let url = this.conf[event];
            //message = JSON.stringify(mess);
            if (url !== undefined) {

                let offline = this.stmtOffline;
                let debug = this.stmtDebug;

                this.resetStmt();

                if (offline) {

                    reject({'status': 'error', 'message': 'debug offline'});
                }

                if (debug) {

                    console.log('');
                    console.log('----------WS-SEND----------', event);
                    console.log(url + '/' + this.conf.channel + '/' + table);
                    console.log(json);
                    console.log('');
                }

                NetInfo.fetch().then((state) => {

                    let isConnected = (state.isInternetReachable !== undefined ? state.isInternetReachable : state.isConnected);
                    if (isConnected) {

                        let body = json;

                        let mac = null;
                        if (WS_config.conf.hash_key)
                            mac = Ws_crypto.sign(body);

                        fetch(url + '/' + this.conf.channel + '/' + table, {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'uuid': this.conf.uuid,
                                'token': this.conf.token,
                                'mac': mac !== null ? mac.mac : null,
                            },
                            body: JSON.stringify(body)
                        })
                            .then((response) => response.text())
                            .then((response) => {

                                canJSON(response, (json) => {

                                    if (json.status === undefined) {

                                        resolve(json);
                                    } else if (json.status === 'error') {

                                        reject(json);
                                    } else {

                                        resolve(json);
                                    }
                                }, () => {

                                    reject({'status': 'error', 'response': response});
                                });
                            })
                            .catch((error) => {

                                reject({'status': 'error', 'response': error});
                            });
                    } else {

                        reject({'status': 'error', 'message': 'no internet'});
                    }
                });
            } else {

                reject({'status': 'error', 'message': 'url is missing'});
            }
        });
    }

    sendWssMessage(message) {

        if (WS_config.conn !== undefined) {

            WS_config.conn.send(JSON.stringify(message));
        }
    }

    getUpdatedAt(modelData, type) {

        let updated_at = 0;
        if (Object.keys(modelData).length) {

            Object.keys(modelData).map((model_id, k) => {

                let row = modelData[model_id];
                let d = row['updated_at'] !== undefined ? new Date(row['updated_at']) : new Date('1970-01-01');
                let date = d.toISOString();

                if (type == 'ASC')
                    updated_at = !updated_at ? date : (Date.parse(date) > Date.parse(updated_at) ? date : updated_at);

                if (type == 'DESC')
                    updated_at = !updated_at ? date : (Date.parse(date) < Date.parse(updated_at) ? date : updated_at);
            });
        }
        return updated_at === 0 ? null : updated_at;
    }
}

export default WS_connect;
