import Project_WS from '../../../index';
import Wso from "../config";

class Model extends Project_WS.model{

    constructor(wso) {

        super(wso, 'address', 'address_id', 'address_updated_at');
        //this.belongsTo('address');
    }
}

let address = new Model(Wso);

export default address;
