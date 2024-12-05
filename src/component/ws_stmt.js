import WS_config from "./ws_config";
import Ws_crypto from "./ws_crypto";
import Base64 from "./base64";
import unique_id from "./unique_id";

class WS_stmt {

    table = undefined;
    stmtColumn = [];
    stmtJoin = [];
    stmtUse = [];
    stmtWhere = [];
    stmtLimit = [];
    stmtGroup = [];
    stmtOrder = [];
    stmtDebug = false;
    stmtOffline = false;
    stmtData = null;
    stmtCallback = undefined;
    promises = [];
    onPromises = [];
    catchCallback = null;

    constructor(table) {

        if( table !== undefined )
            this.onPromises[table] = this.onPromises[table] === undefined ? false : this.onPromises[table];
    }

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

    setCatch(callback){

        this.catchCallback = callback;
        return this;
    }

    getCatch(callback){

        return this.catchCallback;
    }

    encrypt(data) {

        return Ws_crypto.sign(data);
    }

    setTable(table) {

        this.table = table;
        return this;
    }

    setCallback(callback) {

        this.stmtCallback = callback;
        return this;
    }

    getCallback() {

        return this.stmtCallback !== undefined ? this.stmtCallback : () => {
        };
    }

    unique_id(prefix) {

        return Base64.btoa(prefix + Math.floor(new Date().getTime() / 1000) + unique_id());
    }

    prepareJoin(data){

        let ret = {};
        if (data.length) {

            data.forEach((v, k) => {

                ret[v] = [v, null, null];
            });
        }
        return ret;
    }

    debug() {

        this.stmtDebug = true;
        return this;
    }

    offline() {

        this.stmtOffline = true;
        return this;
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

    setStmt(column, join, use, where, group, order, limit) {

        this.stmtColumn = [];
        this.stmtJoin = [];
        this.stmtUse = [];
        this.stmtWhere = [];
        this.stmtGroup = [];
        this.stmtOrder = [];
        this.stmtLimit = [];

        if (column !== undefined && column.length) {
            column.map((value) => {
                this.column(value)
            });
        }
        if (join !== undefined && join.length) {
            join.map((value) => {
                this.join(value)
            });
        }
        if (use !== undefined && use.length) {
            use.map((value) => {
                this.use(value)
            });
        }
        if (where !== undefined && where.length) {
            where.map((value) => {
                this.where(value[0], value[1], value[2])
            });
        }

        if (group !== undefined && group.length) {
            group.map((value) => {
                this.group(value)
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
            'column': this.stmtColumn,
            'join': this.stmtJoin,
            'use': this.stmtUse,
            'where': this.stmtWhere,
            'limit': this.stmtLimit,
            'group': this.stmtGroup,
            'order': this.stmtOrder,
        };
    }

    resetStmt() {

        this.stmtColumn = [];
        this.stmtJoin = [];
        this.stmtUse = [];
        this.stmtWhere = [];
        this.stmtLimit = [];
        this.stmtGroup = [];
        this.stmtOrder = [];
        this.stmtDebug = false;
        this.stmtOffline = false;
    }

    setUseCallbackStmt(stmtUseCallback) {

        this.stmtUseCallback = stmtUseCallback;
        return this;
    }

    select(column) {

        this.resetStmt();
        if (column !== undefined)
            this.stmtColumn = Array.isArray(column) ? column : column.replace(/ /gi, '').split(',');
        return this;
    }

    column(column) {

        this.stmtColumn.push(column);
        return this;
    }

    join(method) {

        this.stmtJoin.push(method);
        return this;
    }

    use(method) {

        this.stmtUse.push(method);
        if (this.stmtUseCallback === undefined)
            this.stmtUseCallback = {};

        if (typeof this[method] === "function") {

            this.stmtUseCallback[method] = this[method];
        }
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

    whereIn(column, value){

        this.where(column, 'in', value);
        return this;
    }

    whereNotIn(column, value){

        this.where(column, 'not_in', value);
        return this;
    }

    whereRaw(value, params = null) {

        this.stmtWhere.push([value, "raw", params]);
        return this;
    }

    group(group) {

        this.stmtGroup.push(group);
        return this;
    }

    order(column, order) {

        this.stmtOrder.push([column, order]);
        return this;
    }

    limit(limit, offset = 0) {

        this.stmtLimit = [limit, offset];
        return this;
    }

    addPromise(callback, args) {

        this.promises.push(
            function (callback, args) {

                return new Promise((resolve, reject) => {
                    callback(resolve, reject, args);
                });
            }.bind(this, callback, args)
        );
    }

    runPromises() {

        if (this.promises.length && !this.onPromises[this.table]) {

            this.onPromises[this.table] = true;
            let promise = this.promises.shift();
            promise().then((res) => {

                setTimeout(() => {

                    this.onPromises[this.table] = false;
                    if (this.promises.length)
                        this.runPromises();
                }, 10);
                return res;
            });
        }
    }
}

export default WS_stmt;
