import * as SQLite from 'expo-sqlite';
import WS_config from "./ws_config";
import WS_model from "./ws_model";
import error from "./error";
import pre from "./pre";

class DB {

    #db;
    #table;
    #fillable;
    #action;
    #sync = {};

    params = {};
    param_values = {};
    show_debug = false;
    #result;

    constructor(table, fillable) {

        if (table) {

            this.#table = table;
            this.#fillable = fillable;

            if (fillable === undefined || !fillable.length)
                console.error(`TABLE ${table} has no fillable properties`);
        }
    }

    init(name, callback) {

        this.#db = name;
        WS_config.db = SQLite.openDatabaseSync(name);
        callback();
    }

    reset() {

        WS_config.db.closeSync();
        SQLite.deleteDatabaseSync(this.#db);
        WS_config.db = SQLite.openDatabaseSync(this.#db);
        return new Promise((resolve, reject) => resolve('true'));
    }

    raw(value) {

        return {'raw': value};
    }

    query(query, params) {

        return new Promise((resolve, reject) => {

            let value = null;
            this.exec(query, params, (result) => value = result.getAllSync());
            resolve(value);
        });
    }

    select(column = '*') {

        this.params['SELECT'] = "SELECT " + (Array.isArray(column) ? column.join(',') : column);
        this.from(this.#table);
        return this;
    }

    from(table) {

        this.params['FROM'] = table;
        return this;
    }

    join(value) {

        this.params['JOIN'] = this.raw("INNER JOIN " + value);
        return this;
    }

    leftJoin(value) {

        this.params['JOIN'] = this.raw("LEFT JOIN " + value);
        return this;
    }

    when(condition, callback) {

        if (condition)
            callback(this);

        return this;
    }

    where(column, operator, value) {

        if (typeof column == 'object' && !Array.isArray(column) && operator === undefined && value === undefined) {

            let columns = Object.keys(column);
            columns.forEach((col) => {

                this.where(col, '=', column[col]);
            });
            return this;
        }

        let column_temp = column.replace('.', '_');

        //regular
        if (value === undefined) {

            value = operator;
            operator = '=';
        }

        if (this.params['WHERE'] === undefined)
            this.params['WHERE'] = [`${column} ${operator} $where_${column_temp}`];
        else
            this.params['WHERE'].push(`${column} ${operator} $where_${column_temp}`);

        if (this.#sync['WHERE'] === undefined)
            this.#sync['WHERE'] = [[column, operator, value]];
        else
            this.#sync['WHERE'].push([column, operator, value]);

        this.param_values['$where_' + column_temp] = value;
        return this;
    }

    whereRaw(where, params = null) {

        if (this.params['WHERE'] === undefined)
            this.params['WHERE'] = [`${where}`];
        else
            this.params['WHERE'].push(`${where}`);

        if (this.#sync['WHERE_RAW'] === undefined)
            this.#sync['WHERE_RAW'] = [where];
        else
            this.#sync['WHERE_RAW'].push(where);

        if (params) {

            this.param_values.push(params);
        }

        return this;
    }

    order(column, order) {

        if (this.params['ORDER BY'] === undefined)
            this.params['ORDER BY'] = [];
        this.params['ORDER BY'].push([`${column} ${order}`]);

        return this;
    }

    group(value) {

        if (this.params['GROUP BY'] === undefined)
            this.params['GROUP BY'] = [];
        this.params['GROUP BY'].push([`${value}`]);

        return this;
    }

    limit(limit, offset = 0) {

        this.params['LIMIT'] = `${offset}, ${limit}`;
        return this;
    }

    fetchAll(callback) {

        let value = [];
        let query = this.build();
        this.exec(query, this.param_values, (result) => value = result.getAllSync());
        callback(value);
    }

    fetch(callback) {

        if (this.params['LIMIT'] === undefined)
            this.limit(1);

        let value = {};
        let query = this.build();
        this.exec(query, this.param_values, (result) => value = result.getFirstSync());
        callback(value);
    }

    fetchEach(callback) {

        let query = this.build();
        let statement = null;

        try {

            statement = WS_config.db.getEachSync(query, this.param_values);
            for (let row of statement) {

                callback(row);
            }
        } catch (e) {

            error({
                'message': 'SQLITE ERROR',
                'query': query,
                'error': e,
            });
        }
    }

    insert(data) {

        this.#action = 'insert';
        this.#sync['VALUES'] = data;
        this.params = {};
        this.param_values = {};
        this.params['INSERT'] = this.raw(
            "INSERT INTO `" + this.#table +
            "` (" + this.#fillable.map((col) => {

                return data[col] !== undefined ? col : undefined;
            }).filter((val) => val !== undefined) + ") " +
            "VALUES " +
            "(" + this.#fillable.map((col) => {

                return data[col] !== undefined ? `$insert_${col}` : undefined;
            }).filter((val) => val !== undefined) + ")"
        );

        this.#fillable.map((col) => {

            if (data[col] !== undefined)
                this.param_values[`$insert_${col}`] = data[col];
        });

        if (this.show_debug) {

            this.debug();
        }
        let query = this.build();
        this.#result = this.exec(query, this.param_values);

        return this;
    }

    update(data) {

        this.#action = 'update';
        this.#sync['SET'] = data;
        if (this.params['WHERE'] === undefined) {

            this.#action = null;
            console.error('Missing delete WHERE statement');
            return this;
        }

        this.params['UPDATE'] = "`" + this.#table + "`";
        this.params['SET'] = this.#fillable.map((col) => {

            return data[col] !== undefined ? `${col} = $set_${col}` : undefined;
        }).filter((val) => val !== undefined);

        this.#fillable.forEach((col) => {

            if (data[col] !== undefined)
                this.param_values[`$set_${col}`] = data[col];
        });

        if (this.show_debug) {

            this.debug();
        }

        let query = this.build();
        this.#result = this.exec(query, this.param_values);

        return this;
    }

    upsert(data, uniqueColumnsWhere) {

        this.#action = 'upsert';
        this.#sync['VALUES'] = data;
        let value = {};

        //FETCH DATA BY uniqueColumnsWhere
        if (uniqueColumnsWhere !== undefined && uniqueColumnsWhere && Object.keys(uniqueColumnsWhere).length)
            this.select().where(uniqueColumnsWhere).limit(1).fetch((row) => value = row);
        value = value == null || value === undefined ? {} : value;

        //INSERT OR IGNORE
        if (Object.keys(value).length === 0) {

            let insert_data = {...data, ...(uniqueColumnsWhere !== undefined ? uniqueColumnsWhere : {})};
            this.params = {};
            this.param_values = {};
            this.params['INSERT'] = this.raw(
                "INSERT OR IGNORE INTO `" + this.#table +
                "` (" + this.#fillable.map((col) => {

                    return insert_data[col] !== undefined ? col : undefined;
                }).filter((val) => val !== undefined) + ") " +
                "VALUES " +
                "(" + this.#fillable.map((col) => {

                    return insert_data[col] !== undefined ? `$insert_${col}` : undefined;
                }).filter((val) => val !== undefined) + ")" +
                ";"
            );

            this.#fillable.map((col) => {

                if (insert_data[col] !== undefined)
                    this.param_values[`$insert_${col}`] = insert_data[col];
            });

            if (this.show_debug) {

                this.debug();
            }

            let query = this.build();
            let result = this.exec(query, this.param_values);

            if (result.changes !== undefined && result.changes) {

                //register where for sync
                this.where(uniqueColumnsWhere);
                delete this.params['WHERE'];

                this.#result = result;

                return this;
            }
        }

        //UPDATE
        this.params = {};
        this.param_values = {};
        this.params['UPDATE'] = "`" + this.#table + "`";
        this.params['SET'] = this.#fillable.map((col) => {

            return data[col] !== undefined ? `${col} = $set_${col}` : undefined;
        }).filter((val) => val !== undefined);
        this.where(uniqueColumnsWhere);

        this.#fillable.map((col) => {

            if (data[col] !== undefined)
                this.param_values[`$set_${col}`] = data[col];
        });

        if (this.show_debug) {

            this.debug();
        }

        let query_2 = this.build();
        this.#result = this.exec(query_2, this.param_values);

        return this;
    }

    delete() {

        this.#action = 'delete';
        if (this.params['WHERE'] === undefined) {

            this.#action = null;
            console.error('Missing delete WHERE statement');
            return this;
        }

        this.params['DELETE'] = "FROM `" + this.#table + "`";
        if (this.show_debug) {

            this.debug();
        }

        let query = this.build();
        this.#result = this.exec(query, this.param_values);

        return this;
    }

    sync() {

        if (!this.#action) {

            console.error('Missing action, ensure that sync is after the fetch, insert, update, upsert or delete methods');
            return null;
        }

        let action = this.#action;

        let model = new WS_model(WS_config.ws, this.#table);

        if (this.#sync && Object.values(this.#sync).length) {

            if (this.#sync['WHERE'] !== undefined) {

                this.#sync['WHERE'].map((where) => model.where(where[0], where[1], where[2]));
            }
            if (this.#sync['WHERE_RAW'] !== undefined) {

                this.#sync['WHERE_RAW'].map((where) => model.whereRaw(where[0]));
            }

            if (action === 'insert') {

                model.insert(this.#sync['VALUES']);
            }
            if (action === 'update') {

                model.update(this.#sync['SET']);
            }
            if (action === 'upsert') {

                model.upsert(this.#sync['VALUES'], this.#sync['WHERE']);
            }
            if (action === 'delete') {

                model.delete();
            }
        }

        return this;
    }

    result() {

        return this.#result;
    }

    debug() {

        this.show_debug = true;

        if (Object.values(this.params).length) {

            let query = this.build();
            console.log('SQL DEBUG');
            console.log(pre(query));
            console.log(pre(this.param_values));
            console.log('/SQL DEBUG');
        }

        return this;
    }

    build() {

        let query = [];

        this.implode(query, 'SELECT');
        this.implode(query, 'INSERT');
        this.implode(query, 'UPDATE');
        this.implode(query, 'DELETE');
        this.implode(query, 'SET', ',');
        this.implode(query, 'FROM');
        this.implode(query, 'JOIN');
        this.implode(query, 'WHERE', ' AND ');
        this.implode(query, 'ORDER BY', ',');
        this.implode(query, 'GROUP BY', ',');
        this.implode(query, 'LIMIT');

        return query.join(' ').trim(' ');
    }

    exec(query, values, callback) {

        let statement, result = null;

        try {

            statement = WS_config.db.prepareSync(query);
            result = statement.executeSync(values);
            if (callback !== undefined) callback(result);
        } catch (e) {

            error({
                'message': 'SQLITE ERROR',
                'query': query,
                'error': e,
            });
        } finally {

            statement.finalizeSync();
        }

        return result;
    }

    implode(query, name, sub_glue = '') {

        if (this.params[name] !== undefined) {

            let value = this.params[name];
            if (typeof value === 'object' && !Array.isArray(value) && value !== null && value.raw !== undefined) {

                query.push(value.raw);
            } else {

                query.push((['SELECT'].indexOf(name) === -1 ? name : '') + ' ' + (Array.isArray(value) ? value.join(sub_glue) : value));
            }
            query = query.filter(function (el) {
                return el != null && el !== undefined;
            });
        }
    }
}

export default DB;
