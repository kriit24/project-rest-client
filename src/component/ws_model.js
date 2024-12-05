import * as FileSystem from 'expo-file-system';
import sync from "./ws_sync";
import WS_stmt from "./ws_stmt";
import WS_fetchdata from "./ws_fetchdata";
import WS_config from "./ws_config";
import foreach from "./foreach";
import DB from "./ws_sql_lite";

class WS_model extends WS_stmt {

    constructor(ws, table) {

        super(table);

        if (ws === undefined) {

            console.error('project-rest-client ERROR: WS is undefined, this is caused by setting the configuration later then callid the model');
            return this;
        }

        this.setWs(ws);
        this.setTable(table);

        if (!this.table) {

            throw new Error('Model table name is empty');
            return this;
        }

        (async () => {

            let dirInfo = await FileSystem.getInfoAsync(WS_config.STORAGE_DIR);
            if (!dirInfo.exists) {

                FileSystem.makeDirectoryAsync(WS_config.STORAGE_DIR, {intermediates: true});
            }

            let dirInfo_2 = await FileSystem.getInfoAsync(WS_config.STORAGE_DIR + '/' + this.ws.channel);
            if (!dirInfo_2.exists) {

                FileSystem.makeDirectoryAsync(WS_config.STORAGE_DIR + '/' + this.ws.channel, {intermediates: true});
            }

            new sync(this.table);
        })();
    }

    SQL(appends) {

        let db = new DB(this.table, this.fillable);

        if (appends !== undefined && appends.length) {

            foreach(appends, (k, name) => {

                db[name] = this[name];
            });
        }

        return db;
    }

    with(model) {

        this.join(model);
        return this;
    }

    insert(data) {

        let uniqueId = this.unique_id(this.table);

        this.addPromise((resolve, reject, data) => {

            (new sync(this.table))
                .send({'event': 'post', 'model': this.table, 'data': data});

            resolve(true);
        }, Object.assign(Object.assign({'data_unique_id': null}, data), {'data_unique_id': uniqueId}));
        this.runPromises();

        return uniqueId;
    }

    //.where().update({set: 1});
    //.whereRaw().update({set: 1});

    update(data) {

        let d = Object.assign({}, data);
        let w = this.stmtWhere;

        this.addPromise((resolve, reject, data) => {

            let model_sync = new sync(this.table);

            if (data.set !== undefined && data.set !== null && data.where !== undefined && data.where !== null) {

                model_sync.send({'event': 'put', 'model': this.table, 'data': data});
            }

            resolve(true);
        }, {'set': d, 'where': w});
        this.runPromises();
    }

    upsert(data, uniqueColumnsWhere) {

        let d = Object.assign({}, data);
        let w = uniqueColumnsWhere !== undefined ? uniqueColumnsWhere : null;

        this.addPromise((resolve, reject, data) => {

            (new sync(this.table))
                .send({'event': 'push', 'model': this.table, 'data': data});

            resolve(true);
        }, {'set': d, 'where': w});
        this.runPromises();
    }

    //.where().delete();
    //.whereRaw().delete();
    delete() {

        let w = this.stmtWhere;

        this.addPromise((resolve, reject, data) => {

            let model_sync = new sync(this.table);
            model_sync.send({'event': 'delete', 'model': this.table, 'data': data});

                    resolve(true);
        }, {'where': w});
        this.runPromises();
    }

    fetchAll(callback) {

        let {column, join, use, where, group, order, limit} = this.getStmt();
        this.resetStmt();

        this.addPromise((resolve, reject, data) => {

            let {column, join, use, where, group, order, limit} = data;
            this.setStmt(column, join, use, where, group, order, limit);

            new WS_fetchdata(this.table)
                .setCatch(this.getCatch())
                .setStmt(column, join, use, where, group, order, limit)
                .setUseCallbackStmt(this.stmtUseCallback)
                .fetch((rows) => {

                    callback(rows.length ? rows : []);
                    resolve(true);
                });
        }, Object.assign({}, {column: column, join: join, use: use, where: where, limit: limit, group: group, order: order}));
        this.runPromises();
    }

    fetch(callback) {

        let {column, join, use, where, group, order, limit} = this.getStmt();
        this.resetStmt();

        this.addPromise((resolve, reject, data) => {

            let {column, join, use, where, group, order, limit} = data;
            this.setStmt(column, join, use, where, group, order, limit);

            new WS_fetchdata(this.table)
                .setCatch(this.getCatch())
                .setStmt(column, join, use, where, group, order, limit)
                .setUseCallbackStmt(this.stmtUseCallback)
                .fetch((rows) => {

                    callback(rows.length ? rows[0] : {});
                    resolve(true);
                });
        }, Object.assign({}, {column: column, join: join, use: use, where: where, limit: limit, group: group, order: order}));
        this.runPromises();
    }

    live(callback, all = false) {

        let {column, join, use, where, group, order, limit} = this.getStmt();
        this.resetStmt();

        this.addPromise((resolve, reject, data) => {

            let {column, join, use, where, group, order, limit, all} = data;
            this.setStmt(column, join, use, where, group, order, limit);

            new WS_fetchdata(this.table)
                .setCatch(this.getCatch())
                .setStmt(column, join, use, where, group, order, limit)
                .setUseCallbackStmt(this.stmtUseCallback)
                .live((rows) => {

                    callback(rows.length ? rows : {});
                    resolve(true);
                }, all);
        }, Object.assign({}, {column: column, join: join, use: use, where: where, limit: limit, group: group, order: order, all: all}));
        this.runPromises();
    }

    liveAll(callback) {

        this.live(callback, true);
    }

    reset(){

        (new sync(this.table)).reset();
    }

    catch(callback){

        super.setCatch(callback);
        return this;
    }
}


export default WS_model;
