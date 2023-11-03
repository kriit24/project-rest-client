import WS_stmt from "./ws_stmt";

class WS_fetchdata extends WS_stmt {

    constructor(table, primaryKey) {

        super();

        this.setTable(table);
        this.setPrimaryKey(primaryKey);
    }

    mergeData(modelData, row) {

        let primaryKey = this.primaryKey;
        if (modelData[row[primaryKey]] === undefined)
            modelData[row[primaryKey]] = row;
        else {

            modelData[row[primaryKey]] = {...modelData[row[primaryKey]], ...row};
        }
        return modelData;
    }

    fetchColumns(column, data) {

        if (column.length && data.length) {

            let c = data.length;
            for (let i = 0; i < c; i++) {

                let row = data[i];
                let filteredArray = {};
                column.forEach((k) => {

                    filteredArray[k] = row[k];
                });
            }
        }
        return data;
    }

    fetch(callback) {

        let {column, join, use, where, order, limit} = this.getStmt();
        this.resetStmt();

        let join_relation = {};
        let stmtUseCallback = this.stmtUseCallback;
        if (join.length) {

            join.forEach((v, k) => {

                if (this.belongsStmt[v] !== undefined) {

                    join_relation[v] = this.belongsStmt[v];
                }
            });
        }

        let use_relation = {};
        if (use.length) {

            use.forEach((v, k) => {

                if (this.belongsStmt[v] !== undefined) {

                    use_relation[v] = this.belongsStmt[v];
                }
            });
        }

        this.ws
            //.debug()
            //.offline()
            .setStmt(column, Object.keys(join_relation), Object.keys(use_relation), where, order, limit)
            .fetch(this.table)
            //fetch success
            .then((e) => {

                let rows = e.data !== undefined ? e.data : {};

                //console.log('---FETCH-DATA---' + this.table, rows.length);
                callback(rows.length ? rows : {});
            })
            //fetch error
            .catch(() => {

                this
                    .fileGetContent(this.ws.channel, this.table)
                    .then(async (modelData) => {

                        if (Object.keys(use_relation).length) {

                            let c = Object.keys(use_relation).length;

                            for (let i = 0; i < c; i++) {

                                let use_k = Object.keys(use_relation)[i];
                                if (stmtUseCallback[use_k] !== undefined) {

                                    let call = stmtUseCallback[use_k](modelData);
                                    if (call instanceof Promise) {

                                        modelData = await call;
                                    } else {

                                        console.error('project-rest-client ERROR: use callback must return new Promise');
                                    }
                                }
                            }
                        }

                        let ret = this.limitData(this.whereFilter(modelData, where), limit[0], limit[1]);

                        //console.log('---CACHE DATA---' + this.table, ret);
                        //console.log('---JOIN-' + this.table, join);

                        //join data to row from file
                        if (ret.length && Object.keys(join_relation).length) {

                            Object.values(join_relation).forEach((join_r) => {

                                let relation = join_r[0];
                                let foreign = join_r[1];
                                let relationPrimary = join_r[2];

                                this
                                    .fileGetContent(this.ws.channel, relation)
                                    .then((modelData_2) => {

                                        ret.forEach((row_2, key_2) => {

                                            let foreignData = this.whereFilter(modelData_2, [[relationPrimary, '=', row_2[foreign]]]);
                                            ret[key_2][relation] = foreignData.length ? foreignData[0] : {};
                                        });
                                        callback(ret.length ? this.fetchColumns(column, ret) : {});
                                    });
                            });
                        } else {

                            callback(ret.length ? this.fetchColumns(column, ret) : {});
                        }
                    });
            });
    }
}

export default WS_fetchdata;
