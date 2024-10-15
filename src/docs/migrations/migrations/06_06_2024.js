import ProjectRest from "project-rest-client";

function sync(){

    return new Promise(async (resolve, reject) => {

        let res = await ProjectRest.DB.query(
            "select count(1) AS c from pragma_table_info('test') where name='name'"
        );
        if( res[0]['c'] === 0 ){

            await ProjectRest.DB.query(
                "ALTER TABLE `test` ADD COLUMN `name` TEXT;"
            );
        }

        resolve('done');
    });
}

export default sync;
