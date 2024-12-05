import {AppState} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import EventSource from "react-native-sse";
import WS_stmt from "./ws_stmt";
import WS_config from "./ws_config";
import canJSON from 'project-can-json';
import filter from "./filter";
import error from "./error";
import pre from "./pre";

class WS_request extends WS_stmt {

    channel = undefined;

    constructor(conf) {

        super(undefined);

        this.setConf(conf);
        this.channel = conf.channel;
    }

    live(table, callback, all = false) {

        let url = this.conf['live'];

        if (url !== undefined) {

            let {column, join, use, where, limit, group, order} = this.getStmt();
            //let offline = this.stmtOffline;
            let debug = this.stmtDebug;

            this.resetStmt();

            NetInfo.fetch().then((state) => {

                let isConnected = (state.isInternetReachable !== undefined && state.isInternetReachable ? state.isInternetReachable : state.isConnected);
                if (isConnected) {

                    let body = {
                        'column': column.length ? column : null,
                        'join': join.length ? join : null,
                        'use': use.length ? use : null,
                        'where': where.length ? where : null,
                        'group': group.length ? group : null,
                        'order': order.length ? order : null,
                        'limit': limit.length && limit[0] !== undefined ? limit[0] : null,
                        'offset': limit.length && limit[1] !== undefined ? limit[1] : null,
                    };

                    let request = url + '/' + this.conf.channel + '/' + table + '?full=' + (all ? 'true' : 'false') + '&query=' + JSON.stringify(body);
                    let mac = null;
                    if (WS_config.conf.hash_key && !body.hasOwnProperty('raw')) {

                        mac = this.encrypt(request);
                        request = request + '&mac=' + mac.mac + '&token=' + this.conf.token;
                    } else {

                        request = request + '&token=' + this.conf.token;
                    }

                    if (debug || WS_config.conf.debug) {

                        console.log('');
                        console.log('----------WS-LIVE----------');
                        console.log(pre(request));
                        console.log('');
                    }

                    const es = new EventSource(request, {timeout: 0, timeoutBeforeConnection: 500});
                    WS_config.ess[encodeURIComponent(request)] = es;

                    es.addEventListener("message", (event) => {

                        canJSON(event.data, (json) => {

                            callback(json.data !== undefined && json.data.length ? json.data : {});
                        }, () => {

                            error({
                                'message': 'LIVE ERROR - RESPONSE IS NOT JSON',
                                'url': request,
                                'response': event
                            });

                            reject({});
                        });
                    });

                    es.addEventListener("close", (event) => {

                        Object.values(WS_config.ess).forEach((ess) => {

                            ess.open();
                        });
                    });

                    if (WS_config.appStateSubscription_3 !== undefined) WS_config.appStateSubscription_3.remove();
                    WS_config.appStateSubscription_3 = AppState.addEventListener('change', nextAppState => {

                        if (WS_config.appStateStat_3.match(/inactive|background/) && nextAppState === 'active') {

                            WS_config.appStateStat_3 = nextAppState;
                            Object.values(WS_config.ess).forEach((ess) => {

                                ess.open();
                            });
                        }
                        WS_config.appStateStat_3 = nextAppState;
                    });
                }
            });
        }
    }

    fetch(table) {

        return new Promise((resolve, reject) => {

            //console.log('STMT-----' + table + '-----------', this.getStmt());
            let url = this.conf['fetch'];

            if (url !== undefined) {

                let {column, join, use, where, limit, group, order} = this.getStmt();
                let offline = this.stmtOffline;
                let debug = this.stmtDebug;

                this.resetStmt();

                if (offline) {

                    reject({});
                }

                NetInfo.fetch().then((state) => {

                    let isConnected = (state.isInternetReachable !== undefined && state.isInternetReachable ? state.isInternetReachable : state.isConnected);
                    if (isConnected) {

                        let body = {
                            'column': column.length ? column : null,
                            'join': join.length ? join : null,
                            'use': use.length ? use : null,
                            'where': where.length ? where : null,
                            'group': group.length ? group : null,
                            'order': order.length ? order : null,
                            'limit': limit.length && limit[0] !== undefined ? limit[0] : null,
                            'offset': limit.length && limit[1] !== undefined ? limit[1] : null,
                        };

                        let mac = null;
                        if (WS_config.conf.hash_key && !body.hasOwnProperty('raw'))
                            mac = this.encrypt(body);

                        if (debug || WS_config.conf.debug) {

                            console.log('');
                            console.log('----------WS-FETCH----------');
                            console.log(this.conf.fetch + '/' + this.conf.channel + '/' + table);
                            console.log('                 ---HEADER---');
                            console.log(
                                filter({
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json',
                                    'Authorization': this.conf.authorization,
                                    'token': this.conf.token,
                                    'mac': mac !== null ? mac.mac : null,
                                })
                            );
                            console.log('                 ---BODY---');
                            console.log(JSON.stringify(body));
                            console.log('');
                        }

                        fetch(url + '/' + this.conf.channel + '/' + table, {
                            method: 'POST',
                            headers: filter({
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'Authorization': this.conf.authorization,
                                'token': this.conf.token,
                                'mac': mac !== null ? mac.mac : null,
                            }),
                            body: JSON.stringify(body),
                        })
                            .then(async (response) => {

                                let headers = response.headers;
                                headers.url = response.url;
                                headers.status = response.status;
                                headers.statusText = response.statusText;
                                return {headers: headers, text: await response.text()};
                            })
                            .then((response) => {

                                let response_text = response.text;
                                if (debug || WS_config.conf.debug) {

                                    console.log('');
                                    console.log('----------FETCH RESPONSE------------');
                                    if (response.headers.status !== 200) {

                                        console.error('FETCH ERROR');
                                    }
                                    console.log(response.headers);
                                    if (response.headers.status !== 200) {

                                        console.log(response_text);
                                    }
                                    console.log('');
                                }

                                if (response.headers.status !== 200) {

                                    reject({});
                                }

                                canJSON(response_text, (json) => {

                                    resolve(json);
                                }, () => {

                                    error({
                                        'message': 'FETCH ERROR - RESPONSE IS NOT JSON',
                                        'url': url + '/' + this.conf.channel + '/' + table,
                                        'response': response_text
                                    });

                                    reject({});
                                });
                            })
                            .catch((error) => {

                                error({
                                    'message': 'FETCH ERROR - SERVER REQUEST FAILED',
                                    'url': url + '/' + this.conf.channel + '/' + table,
                                    'response': error
                                });

                                reject({});
                            });
                    } else {

                        reject({});
                    }
                });
            }
        });
    }

    send(event, table, body) {

        return new Promise((resolve, reject) => {

            let url = this.conf[event];
            if (url !== undefined) {

                let offline = this.stmtOffline;
                let debug = this.stmtDebug;

                this.resetStmt();

                if (offline) {

                    reject({'status': 'error', 'message': 'debug offline'});
                }

                NetInfo.fetch().then((state) => {

                    let isConnected = (state.isInternetReachable !== undefined && state.isInternetReachable ? state.isInternetReachable : state.isConnected);
                    if (isConnected) {

                        let mac = null;
                        if (WS_config.conf.hash_key && !body.hasOwnProperty('raw'))
                            mac = this.encrypt(body);

                        if (debug || WS_config.conf.debug) {

                            console.log('');
                            console.log('----------WS-SEND----------');
                            console.log(url + '/' + this.conf.channel + '/' + table);
                            console.log('                 ---HEADER---');
                            console.log(
                                filter({
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json',
                                    'Authorization': this.conf.authorization,
                                    'token': this.conf.token,
                                    'mac': mac !== null ? mac.mac : null,
                                })
                            );
                            console.log('                 ---BODY---');
                            console.log(JSON.stringify(body));
                            console.log('');
                        }

                        fetch(url + '/' + this.conf.channel + '/' + table, {
                            method: 'POST',
                            headers: filter({
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'Authorization': this.conf.authorization,
                                'token': this.conf.token,
                                'mac': mac !== null ? mac.mac : null,
                            }),
                            body: JSON.stringify(body),
                        })
                            .then(async (response) => {

                                let headers = response.headers;
                                headers.url = response.url;
                                headers.status = response.status;
                                headers.statusText = response.statusText;
                                return {headers: headers, text: await response.text()};
                            })
                            .then((response) => {

                                let response_text = response.text;

                                if (debug || WS_config.conf.debug) {

                                    console.log('');
                                    console.log('----------SEND RESPONSE------------');
                                    if (response.headers.status !== 200) {

                                        console.error('SEND ERROR');
                                    }
                                    console.log(response.headers);
                                    if (response.headers.status !== 200) {

                                        console.log(response_text);
                                    }
                                    console.log('');
                                }

                                if (response.headers.status !== 200) {

                                    reject({});
                                }

                                canJSON(response_text, (json) => {

                                    if (json.status === undefined) {

                                        resolve(json);
                                    } else if (json.status === 'error') {

                                        reject(json);
                                    } else {

                                        resolve(json);
                                    }
                                }, () => {

                                    error({
                                        'message': 'SEND ERROR - RESPONSE IS NOT JSON',
                                        'url': url + '/' + this.conf.channel + '/' + table,
                                        'response': response_text
                                    });

                                    reject({'status': 'error', 'response': response_text});
                                });
                            })
                            .catch((error) => {

                                error({
                                    'message': 'SEND ERROR - SERVER REQUEST FAILED',
                                    'url': url + '/' + this.conf.channel + '/' + table,
                                    'response': error
                                });

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

    getUpdatedAt(modelData, updated_at_column, type) {

        let updated_at = 0;
        if (Object.keys(modelData).length) {

            Object.keys(modelData).map((model_id, k) => {

                let row = modelData[model_id];
                let d = row[updated_at_column] !== undefined ? new Date(row[updated_at_column]) : new Date('1970-01-01');
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

export default WS_request;
