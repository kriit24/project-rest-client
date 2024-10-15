function run(required){

    return required();
}

function migrate(){

    return new Promise(async (resolve, reject) => {

        await run(require('./migrations/05_06_2024').default);
        await run(require('./migrations/06_06_2024').default);
        await run(require('./migrations/07_06_2024').default);

        resolve('done');
    });
}

export default migrate;
