export default function foreach(data, callback){

    if( data === undefined || data === null  ){

        return null;
    }

    let keys = Object.keys(data);
    let ret = [];

    for (let i = 0; i < keys.length; i++) {

        let arrayKey = keys[i];
        let arrayValue = data[arrayKey];

        let cp_ret = callback(arrayKey, arrayValue);
        if( cp_ret !== undefined )
            ret.push(cp_ret);
    }
    return ret;
}
