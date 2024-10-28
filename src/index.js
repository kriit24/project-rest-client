import WS_request from "./component/ws_request";
import WS_model from './component/ws_model';
import DB from './component/ws_sql_lite';

const ProjectRest = {
    config: WS_request,
    DB: new DB(),
    Model: WS_model,
};

export default ProjectRest;
