const CryptoJS = require("crypto-js");

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