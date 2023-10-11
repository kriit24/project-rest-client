import React from 'react';
//npm i crypto-js
import CryptoJS from 'crypto-js';
import Base64 from './base64';
import canJSON from "project-can-json";


/*

import Crypto from './app/helper/crypto';
(async () => {

    Crypto.mac_hash = '1bcba7f5c1eecaf30053dc0a3c374551';

    let mac_hash = Crypto.sign('{ midagimuud }');
    console.log('DATA', mac_hash);

    let dec_1 = Crypto.verify(
        mac_hash.data,
        mac_hash.mac
    );
    console.log('DATA-DE-1-TYPE(' + typeof dec_1 + ')', dec_1);


    let dec_2 = Crypto.verify(
        'muusika',
        'MTIzYjcyMjlkN2RmZTVhYjQyMDU5OTZjYzAzYTAzZjhjODliMTc4YTQyYjgyMTlkNmFlMzFjNGYxZTBkMzI3NjllZGVjODQ3YTQ5MmZhZWY3Nzk2ZDliYjI2MDY3NjI2'
    );
    console.log('DATA-DE-2-TYPE(' + typeof dec_2 + ')', dec_2);
})();
 */
export default class Ws_crypto {

    static mac_hash = null;

    static sign(data) {

        if (!Ws_crypto.mac_hash)
            return {'data': null, mac: null};

        let key_string = Ws_crypto.mac_hash;
        let iv_string = CryptoJS.lib.WordArray.random(16).toString();
        let mac_string = null;
        let encrypted_string = null;

        let encHex = CryptoJS.enc.Hex;
        let aes = CryptoJS.AES;
        let Pkcs7 = CryptoJS.pad.Pkcs7;

        // the key and iv should be 32 hex digits each, any hex digits you want, but it needs to be 32 on length each
        let key = encHex.parse(key_string);
        let iv = encHex.parse(iv_string);
        try {

            //data = JSON.parse(data);
        } catch (error) {

        }
        let data_string = typeof data == 'object' ? JSON.stringify(data) : data;

        // encrypt the message
        encrypted_string = aes.encrypt(data_string, key, {
            iv: iv,
            padding: Pkcs7,
            mode: CryptoJS.mode.CBC
        }).toString();
        mac_string = CryptoJS.HmacSHA256(encrypted_string, key).toString(CryptoJS.enc.Hex);

        return {'data': data_string, 'mac': Base64.btoa(mac_string + iv_string)};
    }

    /*AES
    * param : message
    * return : decrypted string
    */
    static verify(data, mac_hash) {

        if (!Ws_crypto.mac_hash)
            return null;

        let b64_string = Base64.atob(mac_hash);
        let mac_length = 64;
        let iv_length = 32;

        let key_string = Ws_crypto.mac_hash;
        let mac_string = b64_string.substring(0, mac_length);
        let mac_verify = null;
        let iv_string = b64_string.substring(mac_length, mac_length + iv_length);
        let encrypted_string = null;

        let encHex = CryptoJS.enc.Hex;
        let aes = CryptoJS.AES;
        let Pkcs7 = CryptoJS.pad.Pkcs7;

        // the key and iv should be 32 hex digits each, any hex digits you want, but it needs to be 32 on length each
        let key = encHex.parse(key_string);
        let iv = encHex.parse(iv_string);

        let data_string = typeof data == 'object' ? JSON.stringify(data) : data;
        encrypted_string = aes.encrypt(data_string, key, {
            iv: iv,
            padding: Pkcs7,
            mode: CryptoJS.mode.CBC
        }).toString();
        mac_verify = CryptoJS.HmacSHA256(encrypted_string, key).toString(CryptoJS.enc.Hex);

        if (mac_string !== mac_verify)
            return '';

        return canJSON(data);
    }
}
