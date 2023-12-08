<?php

use App\Events\SocketPostToServer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

/*
Route::middleware(['middleware' => 'auth'])->get('/user', function (Request $request) {
    return $request->user();
});

use Illuminate\Http\Request;
*/

//die(json_encode(['status' => 'ok', 'data' => []]));

Route::middleware([\App\Http\Middleware\Authenticate::class/*create your own authenticate middleware*/, \App\Http\Middleware\VerifyPostMac::class])->group(function () {

    Route::post('/post/{db}/{model}', function ($db, $model, Request $request) {

        if (\App\Http\Requests\ValidateRequest::Broadcast($db, $model, $request)) {

            $event = new \App\Broadcasting\DBBroadcast(
                \App\Pusher\MysqlPush::class
            );
            $data = $event->broadcast($db, $model, $request);

            return response(['status' => 'ok', 'count' => !empty($data) ? 1 : 0, 'data' => $data]);
        }
        return response(['status' => 'error', 'message' => 'POST error:' . \App\Http\Requests\ValidateRequest::getError()], 406);
    });

    Route::post('/delete/{db}/{model}', function ($db, $model, Request $request) {

        if (\App\Http\Requests\ValidateRequest::Delete($db, $model, $request)) {

            $event = new \App\Broadcasting\DBBroadcast(
                \App\Pusher\MysqlDelete::class
            );
            $data = $event->broadcast($db, $model, $request);

            return response(['status' => 'ok', 'count' => !empty($data) ? 1 : 0, 'data' => $data]);
        }
        return response(['status' => 'error', 'message' => 'DELETE error:' . \App\Http\Requests\ValidateRequest::getError()], 406);
    });

    Route::post('/fetch/{db}/{model}', function ($db, $model, Request $request) {

        if (\App\Http\Requests\ValidateRequest::Fetch($db, $model, $request)) {

            $event = new \App\Broadcasting\DBBroadcast(
                \App\Getter\MysqlGetter::class
            );
            $data = $event->fetch($db, $model, $request);

            if ($data instanceof Generator || $data instanceof Closure || $data instanceof \Illuminate\Support\LazyCollection) {

                $rows = iterator_to_array($data);
            }
            else {

                $rows = $data;
            }

            return response(['status' => 'ok', 'count' => count($rows), 'data' => $rows]);
        }
        return response(['status' => 'error', 'message' => 'FETCH error:' . \App\Http\Requests\ValidateRequest::getError()], 406);
    });
});
