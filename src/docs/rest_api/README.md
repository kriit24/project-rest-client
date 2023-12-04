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

