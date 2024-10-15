### SQLLite migrations

PUT MIGRATIONS inside init

```
ProjectRest.DB.init(channel, async () => {

    //delete database
    //ProjectRest.DB.reset();
    
    let migrate = require('../database/migrate').default;
    migrate();
    
    /*
    await ProjectRest.DB.query(
        "INSERT INTO test (value, intValue) VALUES (?, ?)", ['test1', 123]
    );
    
    await ProjectRest.DB.query(
        "INSERT INTO test (value, intValue) VALUES (?, ?)", ['test2', 456]
    );
    
    await ProjectRest.DB.query(
        "INSERT INTO test (value, intValue) VALUES (?, ?)", ['test3', 789]
    );
    */
});
```
