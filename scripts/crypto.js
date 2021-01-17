const CryptoJS = require("crypto-js");
const path = require('path');
const config = require('./built/src/config').config

function encrypt(key,content){
    const t = CryptoJS.enc.Utf8.parse(key);
    let passid = CryptoJS.AES.encrypt(content, t, {
        iv:t,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    }).toString().replace(/\//g,"_").replace(/\+/g,"-");
    passid = (passid = (passid = passid.replace("+","-")).replace("/","_")).replace("=","*");

    return passid;
}

function decryptPasswordFromDb(passEncrypted) {
    const secret = config.get('web.encrypt-key');
    return CryptoJS.AES.decrypt(passEncrypted, secret).toString(CryptoJS.enc.Utf8);
}