import ProjectRest from '../../../index';
import Wso from "../config";

class Model extends ProjectRest.model{

    fillable = [
        'object_id', 'object_address_id', 'object_name'
    ];

    constructor(wso) {

        super(wso, 'object');
    }
}

let object = new Model(Wso);

export default object;
