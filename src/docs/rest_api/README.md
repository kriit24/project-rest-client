### LARAVEL MYSQL REST API

See full example in laravel folder


setup hash key for secure requests in config/auth.php

```
'hash' => [
'key' => ''//value generate with \App\Component\Crypto::generateKey();
]
```

set dynamic key for each user in App\Http\Middleware\VerifyPostMac handle method
```
$user_key = (new Auth())->UserData('user_key');
config(['auth.hash.key' => $user_key]);
```


set config "database.model"

```
'model' => function($name = null, $default = null){

        //if table name is "object" then use alias name "objectT", because u cannot use "object" in php
        $alias = ['object' => 'objectT'];
        if( isset($alias[$name]) )
            $name = $alias[$name];

        if( $name ){

            $dir = dirname(__DIR__) . '/app/Models/';
            $file = $name . '.php';

            if( is_file($dir . $file) ){

                return '\App\Models\\' . $name;
            }
            return $default;
        }

        //app/models/class
        $dir = dirname(__DIR__) . '/app/Models/';
        $filterMask = '*.php';
        $files = glob($dir . $filterMask, GLOB_BRACE);
        $ret = [];
        foreach($files as $file){

            $pathinfo = pathinfo($file);

            if( !in_array(strtolower($pathinfo['filename']), ['sql', 'mongo']) ) {

                $ret[] = '\App\Models\\' . $pathinfo['filename'];
            }
        }

        return $ret;
    },
```

and "database.connections.database_name_where_api_connects"
react-native request will be - https://your_domain.com/fetch/{database_name_where_api_connects}/{model}

```
"database_name_where_api_connects" => [
            'driver' => 'mysql',
            'host'      => env('DB_HOST'),
            'port'      => env('DB_PORT'),
            'database'  => env('DB_DATABASE'),
            'username'  => env('DB_USERNAME'),
            'password'  => env('DB_PASSWORD'),
            'fetch'       => PDO::FETCH_ASSOC,
        ],
```
