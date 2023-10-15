import WS_config from "./ws_config";
import * as FileSystem from "expo-file-system";
import Ws_crypto from "./ws_crypto";
import canJSON from "project-can-json";

class WS_stmt {

    table = undefined;
    primaryKey = undefined;
    updatedAt = undefined;
    stmtJoin = [];
    stmtWhere = [];
    stmtLimit = [];
    stmtOrder = [];
    stmtDebug = false;
    stmtOffline = false;
    stmtData = null;
    stmtCallback = null;

    setConf(conf) {

        WS_config.conf = conf;
        Ws_crypto.mac_hash = conf.hash_key;
        return this;
    }

    get conf() {

        return WS_config.conf;
    }

    setWs(ws) {

        WS_config.ws = ws;
        return this;
    }

    get ws() {

        return WS_config.ws;
    }

    setTable(table) {

        this.table = table;
        return this;
    }

    setPrimaryKey(primaryKey) {

        this.primaryKey = primaryKey;
        return this;
    }

    setUpdatedAt(updatedAt){

        this.updatedAt = updatedAt;
        return this;
    }

    setCallback(callback){

        this.stmtCallback = callback;
        return this;
    }

    getCallback(){

        return this.stmtCallback !== undefined ? this.stmtCallback : () => {};
    }

    debug() {

        this.stmtDebug = true;
        return this;
    }

    offline() {

        this.stmtOffline = true;
        return this;
    }

    file(channel, table) {

        if (channel === undefined) {

            console.error('CHANNEL IS MISSING');
        }

        let dir = WS_config.STORAGE_DIR + '/' + channel;
        let file = table + '_model.json';
        return dir + '/' + file;
    }

    fileGetContent(channel, table) {

        return new Promise(async (resolve, reject) => {

            let file = this.file(channel, table);
            let dirInfo = await FileSystem.getInfoAsync(file);
            if (dirInfo.exists) {

                canJSON(
                    await FileSystem.readAsStringAsync(file),
                    (modelData) => {

                        resolve(modelData);
                    },
                    () => {

                        resolve({});
                    });
            } else {

                resolve({});
            }
        });
    }

    setData(data) {

        this.stmtData = data;
        return this;
    }

    getData() {

        let tmp = this.stmtData;
        this.stmtData = null;
        return tmp;
    }

    setStmt(join, where, order, limit) {

        this.stmtJoin = [];
        this.stmtWhere = [];
        this.stmtOrder = [];
        this.stmtLimit = [];

        if (join !== undefined && join.length) {
            join.map((value) => {
                this.join(value)
            });
        }
        if (where !== undefined && where.length) {
            where.map((value) => {
                this.where(value[0], value[1], value[2])
            });
        }

        if (order !== undefined && order.length) {
            order.map((value) => {
                this.order(value[0], value[1])
            });
        }

        if (limit !== undefined && limit.length) {
            this.limit(limit[0], limit[1] !== undefined ? limit[1] : 0);
        }
        return this;
    }

    getStmt() {

        return {
            'join': this.stmtJoin,
            'where': this.stmtWhere,
            'limit': this.stmtLimit,
            'order': this.stmtOrder,
        };
    }

    resetStmt() {

        this.stmtJoin = [];
        this.stmtWhere = [];
        this.stmtLimit = [];
        this.stmtOrder = [];
        this.stmtDebug = false;
        this.stmtOffline = false;
    }

    setBelongsStmt(belongs) {

        this.belongsStmt = belongs;
        return this;
    }

    select(){

        this.resetStmt();
        return this;
    }

    join(method) {

        this.stmtJoin.push(method);
        return this;
    }

    when(condition, callback) {

        if (condition)
            callback(this);

        return this;
    }

    where(column, operator, value) {

        if (value === undefined) {

            value = operator;
            operator = '=';
        }

        this.stmtWhere.push([column, operator, value]);
        return this;
    }

    whereRaw(column) {

        this.stmtWhere.push([column, "raw", null]);
        return this;
    }

    whereFilter(haystack, where) {

        return Object.values(haystack).filter((row) => {

            let exists = 0;
            for (stmtWhere of where) {

                let column = stmtWhere[0];
                let operator = stmtWhere.length === 3 ? stmtWhere[1] : '=';
                let value = stmtWhere.length === 3 ? stmtWhere[2] : stmtWhere[1];
                if (row[column] !== undefined) {

                    if (operator === 'in_array') {

                        if (value.indexOf(row[column]) !== -1)
                            exists += 1;
                    } else if (operator === '=' && typeof (row[column]) == 'string') {

                        if (row[column].toLowerCase() === value.toLowerCase())
                            exists += 1;
                    } else {

                        if (row[column] === value)
                            exists += 1;
                    }
                }
            }
            return exists === Object.keys(where).length ? row : null;
        }, where);
    }

    order(column, order) {

        this.stmtOrder.push([column, order]);
        return this;
    }

    limit(limit, offset = 0) {

        this.stmtLimit = [limit, offset];
        return this;
    }

    limitData(rows, limit, offset) {

        if (limit === undefined && offset === undefined) {

            return rows;
        }
        if (offset === undefined) {

            offset = 0;
        }

        let i = 0;
        let ret = [];
        rows.every((v, k) => {

            if (i >= offset) {

                if (i < limit) {

                    ret.push(v);
                    i++;
                    return true;
                } else {

                    return false;
                }
            }

            i++;
            return true;
        });
        return ret;
    }
}

export default WS_stmt;
