### models
create model file app/models/object.js

```
import ProjectRest from "project-rest-client";
import Wso from "../config";

class Model extends ProjectRest.model{

    constructor(wso) {

        super(wso, 'object', 'object_id');
    }
    
    active(){
        
        this.where('objec_is_ative', 1);
        return this;
    }
}

let object = new Model(Wso);

export default object;

```
