import WS_connect from "./component/ws_connect";
import WS_model from './component/ws_model';
import DB from './component/ws_sql_lite';

const ProjectRest = {
    config: WS_connect,
    DB: new DB(),
    Model: WS_model,
};

export default ProjectRest;
