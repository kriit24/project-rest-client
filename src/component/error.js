import WS_config from "project-rest-client/src/component/ws_config";
import filter from "project-rest-client/src/component/filter";

export default function error(message) {

    if( __DEV__ ){

        console.error(message);
    }

    if (WS_config.conf.error !== undefined) {

        fetch(WS_config.conf.error, {
            method: 'POST',
            headers: filter({
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': WS_config.conf.authorization,
                'token': WS_config.conf.token,
            }),
            body: JSON.stringify(message)
        });
    }
}
