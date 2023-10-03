import Project, {WS_model} from '../../../index';
import Wso from "../config";

class Model extends Project.WS.model{

    constructor(wso) {

        super(wso, 'object', 'object_id');
        this.belongsTo('address', 'object_address_id', 'address_id');
    }
}

let object = new Model(Wso);

export default object;
