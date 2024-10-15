import foreach from "./foreach";

export default function filter(data) {

    if(Array.isArray(data)){

        return data.filter((res) => res !== undefined);
    }

    let keys = Object.keys(data);
    foreach(keys, (k, key) => {

        if (data[key] === undefined)
            delete data[key];
    });
    return data;
}
