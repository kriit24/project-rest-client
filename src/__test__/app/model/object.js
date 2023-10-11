import Project_WS from '../../../index';
import Wso from "../config";

class Model extends Project_WS.model{

    constructor(wso) {

        super(wso, 'object', 'object_id', 'object_updated_at');
        this.belongsTo('address', 'object_address_id', 'address_id');
    }
}

let object = new Model(Wso);

export default object;
