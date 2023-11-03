import * as FileSystem from 'expo-file-system';
import sync from "./ws_sync";
import WS_stmt from "./ws_stmt";
import WS_fetchdata from "./ws_fetchdata";
import WS_config from "./ws_config";

let onPromises = {};

class WS_model extends WS_stmt {

    belongsStmt = {};
    promises = [];

    constructor(ws, table, primaryKey, updatedAt) {

        super();

        if( ws === undefined ){

            console.error('project-rest-client ERROR: WS is undefined, this is caused by setting the configuration later then callid the model');
            return this;
        }

        this.setWs(ws);
        this.setTable(table);
        this.setPrimaryKey(primaryKey);
        this.setUpdatedAt(updatedAt);

        if (!this.table) {

            throw new Error('Model table name is empty');
            return this;
        }
        if (!this.primaryKey) {

            throw new Error('Primary key is empty');
            return this;
        }

        onPromises[this.table] = onPromises[this.table] === undefined ? false : onPromises[this.table];

        (async () => {

            let dirInfo = await FileSystem.getInfoAsync(WS_config.STORAGE_DIR);
            if (!dirInfo.exists) {

                FileSystem.makeDirectoryAsync(WS_config.STORAGE_DIR, {intermediates: true});
            }

            let dirInfo_2 = await FileSystem.getInfoAsync(WS_config.STORAGE_DIR + '/' + this.ws.channel);
            if (!dirInfo_2.exists) {

                FileSystem.makeDirectoryAsync(WS_config.STORAGE_DIR + '/' + this.ws.channel, {intermediates: true});
            }

            let fileInfo = await FileSystem.getInfoAsync(this.file(this.ws.channel, this.table));
            if (!fileInfo.exists) {

                FileSystem.writeAsStringAsync(this.file(this.ws.channel, this.table), JSON.stringify({}));
            }

            let model_sync = new sync(this.table, primaryKey, updatedAt);
            model_sync.listen();
            model_sync.sync();
        })();
    }

    belongsTo(model, foreignKey, primaryKey) {

        this.belongsStmt[model] = [model, foreignKey, primaryKey];
        return this;
    }

    with(model) {

        this.join(model);
        return this;
    }

    clear() {

        this.addPromise(async (resolve, reject) => {

            await FileSystem.writeAsStringAsync(this.file(this.ws.channel, this.table), JSON.stringify({}));
            resolve(true);
        }, {});
        this.runPromises();
    }

    insert(data) {

        this.addPromise((resolve, reject) => {

            let model_sync = new sync(this.table, this.primaryKey, this.updatedAt);
            let primaryKey = this.primaryKey;

            //insert
            if (data[primaryKey] === undefined) {

                model_sync
                    .setCallback((response) => {

                        model_sync.sync();
                    })
                    .send({'event': 'post', 'model': this.table, 'data': data});
            }
            resolve(true);
        }, {});
        this.runPromises();
    }

    save(data) {

        this.addPromise((resolve, reject) => {

            let model_sync = new sync(this.table, this.primaryKey, this.updatedAt);
            let primaryKey = this.primaryKey;

            if (data[primaryKey] !== undefined) {

                model_sync
                    .setCallback((response) => {

                        model_sync.sync();
                    })
                    .send({'event': 'post', 'model': this.table, 'data': data});
            }

            resolve(true);
        }, {});
        this.runPromises();
    }

    delete(primary_id) {

        this.addPromise((resolve, reject) => {

            this
                .fileGetContent(this.ws.channel, this.table)
                .then(async (modelData) => {

                    if (modelData[primary_id] !== undefined) {

                        delete modelData[primary_id];

                        //console.log('DELETE', deleteData);
                        await FileSystem.writeAsStringAsync(this.file(this.ws.channel, this.table), JSON.stringify(modelData));
                    }

                    let primaryKey = this.primaryKey;
                    let deleteData = {};
                    deleteData[primaryKey] = primary_id;

                    let model_sync = new sync(this.table, this.primaryKey, this.updatedAt);
                    model_sync
                        .setCallback((response) => {

                            model_sync.sync();
                        })
                        .send({'event': 'delete', 'model': this.table, 'data': deleteData});

                    resolve(true);
                });
        }, {});
        this.runPromises();
    }

    fetchAll(callback) {

        let {column, join, use, where, order, limit} = this.getStmt();
        this.resetStmt();

        this.addPromise((resolve, reject) => {

            //let {join, where, order, limit} = this.getStmt();
            //this.resetStmt();

            new WS_fetchdata(this.table, this.primaryKey)
                .setStmt(column, join, use, where, order, limit)
                .setBelongsStmt(this.belongsStmt)
                .setUseCallbackStmt(this.stmtUseCallback)
                .fetch((rows) => {

                    callback(rows.length ? rows : []);
                    resolve(true);
                });
        }, {column: column, join: join, use: use, where: where, limit: limit, order: order});
        this.runPromises();
    }

    fetch(callback) {

        let {column, join, use, where, order, limit} = this.getStmt();
        this.resetStmt();

        this.addPromise((resolve, reject) => {

            //let {join, where, order, limit} = this.getStmt();
            //this.resetStmt();

            new WS_fetchdata(this.table, this.primaryKey)
                .setStmt(column, join, use, where, order, limit)
                .setBelongsStmt(this.belongsStmt)
                .setUseCallbackStmt(this.stmtUseCallback)
                .fetch((rows) => {

                    callback(rows.length ? rows[0] : {});
                    resolve(true);
                });
        }, {column: column, join: join, use: use, where: where, limit: limit, order: order});
        this.runPromises();
    }

    addPromise(callback, args) {

        this.promises.push(
            function (callback, args) {

                if (Object.keys(args).length) {

                    let {column, join, use, where, order, limit} = args;
                    this.setStmt(column, join, use, where, order, limit);
                }

                return new Promise((resolve, reject) => {
                    callback(resolve, reject);
                });
            }.bind(this, callback, args)
        );
    }

    runPromises() {

        if (this.promises.length && !onPromises[this.table]) {

            onPromises[this.table] = true;
            let promise = this.promises.shift();
            promise().then((res) => {

                setTimeout(() => {

                    onPromises[this.table] = false;
                    if (this.promises.length)
                        this.runPromises();
                }, 10);
                return res;
            });
        }
    }
}


export default WS_model;
