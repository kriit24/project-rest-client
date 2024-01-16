export default function callback(){

    let callback = arguments[0];
    let object = arguments[1];
    let args = [];

    for (var i = 2; i < arguments.length; i++) {

        args.push(arguments[i]);
    }

    let priv = function(){

        let callback = arguments[0];
        let args = arguments[1];
        callback.apply(this, [].concat(args));
    };

    if( object )
        priv = priv.bind(Object.assign(Object.create(Object.getPrototypeOf(object)), object), callback, args);
    else
        priv = priv.bind(this, callback, args);
    priv();
}
