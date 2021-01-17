import * as express from 'express';
import * as request from 'request-promise-native';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as path from 'path';
import { strEnc } from '../utils/des';
import { querySync } from '../db';
import { ua, LOGINURL } from '../config';
import { logger, encryptPassWord, comparePassword} from '../utils';
import { WebError, ErrorCode } from './common'

const register = express.Router();

export interface StuInfo {
    user: string,
    password: string,
    email: string
}

async function queryUserInfo(user: string): Promise<StuInfo[]> {
    const sql = `select * from LoginData where user="${user}"`;
    logger.debug(sql);
    return querySync(sql);
}

async function loginToJNUBackend(stuInfo: StuInfo):Promise<boolean> {
    try {
        const reqOptions = {
            uri: LOGINURL,
            headers: {
                "User-Agent": ua
            },
            jar: request.jar()
        };
        const htmlContent = await request(reqOptions);
        logger.debug('htmlContent from jnu protal: ', htmlContent.length);
        const relt = new RegExp(/id="lt" name="lt" value="(.*?)"/);
        const reexe = new RegExp(/name="execution" value="(.*?)"/);
        const lt = htmlContent.match(relt)[1];
        const exe = htmlContent.match(reexe)[1];
        const rsa = strEnc(stuInfo.user + stuInfo.password + lt, '1', '2', '3');
        const loginData = {
            'rsa': rsa,
            'ul': stuInfo.user.length,
            'pl': stuInfo.password.length,
            'lt': lt,
            'execution': exe,
            '_eventId': 'submit'
        };
        logger.debug('login data: ', JSON.stringify(loginData));
        reqOptions['method'] = 'POST';
        reqOptions['form'] = loginData;
        reqOptions['simple'] = false;
        reqOptions['resolveWithFullResponse'] = true;
        const loginResult = await request(reqOptions);
        logger.debug('login result is: ')
        logger.debug(loginResult.body);
        return loginResult.body.length === 0;
    } catch (err) {
        logger.debug('failed to login to jnu digital protal');
        throw new WebError(ErrorCode.ServerError, 'failed to login to jnu digital protal')
    }
}

async function updatePasswordAndEmail(stuInfo: StuInfo): Promise<StuInfo[]>{
    const encryptedPass = await encryptPassWord(stuInfo.password)
    const sql = `update LoginData set password="${encryptedPass}", email="${stuInfo.email}" where user="${stuInfo.user}"`;
    logger.debug(sql);
    return querySync(sql);
}

async function addUserToDatabase(stuInfo: StuInfo): Promise<StuInfo[]>{
    const encrypted= await encryptPassWord(stuInfo.password);
    const sql = 'insert into LoginData ( user, password, email )' + 
    `values ("${stuInfo.user}", "${encrypted}", "${stuInfo.email}")`;
    const result = await querySync(sql);
    logger.debug(`addUsreToDatabase ${JSON.stringify(result)}`);
    return result;
}

register.get('/', async (req: express.Request, res: express.Response, next: express.NextFunction)=>{
    try {
        logger.debug('process request body: ', JSON.stringify(req.body), 'query: ', JSON.stringify(req.query), 'header: ', JSON.stringify(req.headers));
        if(req.query["clear"] == "true") {
            _.unset(req.session, 'userinfo');
        }
        if(_.get(req.session, 'userinfo')) {
            logger.debug('user have logined, redirect')
            return res.redirect('/info');
        }
        res.set({'Content-type': 'text/html'});
        res.send(fs.readFileSync(path.join(__dirname,"../../../public/register.html")).toString());
    } catch (err) {
        logger.debug('error happend: ', err);
        next(err)
    }
    
})

register.post('/',async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const stuInfo = req.body as StuInfo;
        logger.debug('process request body: ', JSON.stringify(stuInfo), 'header: ', JSON.stringify(req.headers));
        const isValidUser = await loginToJNUBackend(stuInfo);
        if (!isValidUser) {
            throw new WebError(ErrorCode.InvalidUser, '登录数字暨大失败，请检查学号密码是否正确');
        }
        logger.debug('login to jnu protal successfully!!!')
        _.set(req.session, 'userinfo', stuInfo.user);
        const result = await queryUserInfo(stuInfo.user);
        if (result.length === 0) {
            await addUserToDatabase(stuInfo);
            return res.redirect('/info');
        }
        logger.debug("user in db: ", JSON.stringify(result));
        
        const userInDb = result[0];
        const infoChanged = !(await comparePassword(stuInfo.password, userInDb.password) && stuInfo.email === userInDb.email);
        if (infoChanged) {
            logger.debug('user info changed, should update user data')
            await updatePasswordAndEmail(stuInfo);
        }
        return res.redirect('/info');
    } catch (err) {
        next(err);
    }
});


export {
    register
}