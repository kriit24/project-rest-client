import ProjectRest from "project-rest-client";

function sync(){

    return new Promise(async (resolve, reject) => {

        await ProjectRest.DB.query(
            "CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY NOT NULL, value TEXT NOT NULL, intValue INTEGER);"
        );


        await ProjectRest.DB.query(
            "CREATE INDEX IF NOT EXISTS test_value_index ON test(value);"
        );

        resolve('done');
    });
}

export default sync;
