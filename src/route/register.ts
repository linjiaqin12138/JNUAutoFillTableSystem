import * as express from 'express';
import * as request from 'request-promise-native';
import {strEnc} from '../utils/des';
import {db} from '../db';
import {ua,LOGINURL} from '../config';
import {buildInsertQuery,buildSelectQuery,addDoubleQuotesForValue,buildUpdateQuery} from '../utils';

const register = express.Router();

async function checkIfUserExist(req:express.Request){
    let exist = false;
    const sql = buildSelectQuery("LoginData",['user'],"where user=" + addDoubleQuotesForValue(req.body.stuNum));
    console.log(sql);
    let result = await db.queryOnce(sql);
    if(result.length > 0) {
        exist = true;
    }
    return exist;
}
async function checkIfPasswordAndEmailChange(req){
    let change = false;
    const userToBeCheck = {
        'user': req.body.stuNum,
        'password': req.body.passkey
    };
    const sql = buildSelectQuery("LoginData",
        ['user','password','Email'],
        "where user=" + addDoubleQuotesForValue(req.body.stuNum)
        + " and password=" + addDoubleQuotesForValue(req.body.passkey)
        + " and Email="+ addDoubleQuotesForValue(req.body.email)
    );
    console.log(sql);
    const result = await db.queryOnce(sql);
    if(result.length > 0){
        change = true;
    }
    return change;
}
async function loginToJNUBackend(req):Promise<boolean> {
    const ReqForAuth = {
        uri: LOGINURL,
        headers: {
            "User-Agent": ua
        }
    };
    const cookieJar = request.jar();
    ReqForAuth['jar'] = cookieJar;
    return await request(ReqForAuth).then((html)=>{
        const relt = new RegExp(/id="lt" name="lt" value="(.*?)"/);
        const reexe = new RegExp(/name="execution" value="(.*?)"/);
        const lt = html.match(relt)[1];
        const exe = html.match(reexe)[1];
        const rsa = strEnc(req.body.stuNum+req.body.passkey+lt,'1','2','3');
        const loginData = {
            'rsa': rsa,
            'ul': req.body.stuNum.length,
            'pl': req.body.passkey.length,
            'lt': lt,
            'execution': exe,
            '_eventId': 'submit'
        };
        return loginData;
    })
    .then(loginData=>{
        ReqForAuth['method'] = 'POST';
        ReqForAuth['form'] = loginData;
        ReqForAuth['simple'] = false;
        ReqForAuth['resolveWithFullResponse'] = true;
        return request(ReqForAuth);
    })
    .then(html=>{
        return html.body.length == 0;
    });
}
async function updatePasswordAndEmail(req){
    const query = buildUpdateQuery("LoginData",["password","Email"],[req.body.passkey,req.body.email],"where user=" + addDoubleQuotesForValue(req.body.user));
    await db.queryOnce(query);
}
async function addUserToDatabase(req){
    const query = buildInsertQuery("LoginData",
        ["user","password","Email"],
        [req.body.stuNum,req.body.passkey,req.body.email]
    );
    await db.queryOnce(query);
}
register.post('/',async (req:any,res,next)=>{
    if(await loginToJNUBackend(req)){
        req.session.userinfo = req.body.stuNum;
        if(await checkIfUserExist(req)){
            if(await checkIfPasswordAndEmailChange(req)){
                await updatePasswordAndEmail(req);
            }
            res.redirect("/info");
        }else{
            await addUserToDatabase(req);
            res.redirect("/info/infofill");
        }
    }else{
        res.status(401).send("登录失败，<a href=\""+"/static/register.html"+"\">重新输入</a>");
    }
});


export {
    register
}