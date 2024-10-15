import ProjectRest from "project-rest-client";

function sync(){

    return new Promise(async (resolve, reject) => {

        await ProjectRest.DB.query(
            "DROP INDEX IF EXISTS test_value_unique_index;"
        );

        /*
        await ProjectRest.DB.query(
            "DROP INDEX IF EXISTS test_value_index;"
        );

        await ProjectRest.DB.query(
            "CREATE UNIQUE INDEX IF NOT EXISTS test_value_unique_index ON test(value);"
        );
        */

        resolve('done');
    });
}

export default sync;
