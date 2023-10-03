import Project from '../../../index';
import Wso from "../config";

class Model extends Project.WS.model{

    constructor(wso) {

        super(wso, 'address', 'address_id');
        //this.belongsTo('address');
    }
}

let address = new Model(Wso);

export default address;
