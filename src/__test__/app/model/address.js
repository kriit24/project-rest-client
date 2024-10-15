import ProjectRest from '../../../index';
import Wso from "../config";

class Model extends ProjectRest.model{

    fillable = [
        'address_id', 'address_address'
    ];

    constructor(wso) {

        super(wso, 'address');
    }
}

let address = new Model(Wso);

export default address;
