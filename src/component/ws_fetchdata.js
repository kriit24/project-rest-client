import WS_stmt from "./ws_stmt";

class WS_fetchdata extends WS_stmt {

    constructor(table) {

        super();

        this.setTable(table);
    }

    fetch(callback) {

        let {column, join, use, where, group, order, limit} = this.getStmt();
        this.resetStmt();

        let join_relation = this.prepareJoin(join);
        let use_relation = this.prepareJoin(use);

        this.ws
            //.debug()
            //.offline()
            .setStmt(column, Object.keys(join_relation), Object.keys(use_relation), where, group, order, limit)
            .fetch(this.table)
            //fetch success
            .then((e) => {

                let rows = e.data !== undefined ? e.data : {};

                //console.log('---FETCH-DATA---' + this.table, rows.length);
                callback(rows.length ? rows : {});
            })
            //fetch error
            .catch(() => {
            });
                        }

    live(callback, all = false){

        let {column, join, use, where, group, order, limit} = this.getStmt();
        this.resetStmt();

        let join_relation = this.prepareJoin(join);
        let use_relation = this.prepareJoin(use);

        this.ws
            //.debug()
            //.offline()
            .setStmt(column, Object.keys(join_relation), Object.keys(use_relation), where, group, order, limit)
            .live(this.table, callback, all);
    }
}

export default WS_fetchdata;
