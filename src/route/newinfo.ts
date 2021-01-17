import * as express from 'express';
import { querySync } from '../db';
import { logger } from '../utils';
import * as _ from 'lodash';
import { WebError, ErrorCode } from './common';

const infoRouter = express.Router();
function checkLogin(req:express.Request ,res: express.Response, next:express.NextFunction): void {
    if(!_.get(req.session, 'userinfo')) {
        logger.debug('user havenot logined, redirect')
        return res.redirect('/newregister');
    }
    next();
}

infoRouter.get('/',checkLogin, async (req:express.Request, res: express.Response, _next:express.NextFunction) => {
    const result = await querySync(`select * from LoginData where user="${_.get(req.session, 'userinfo')}"`);
    if (result.length > 0) {
        return res.render('info',{
            stuNum: result[0]['user'],
            email: result[0]['email'],
        });
    }
    throw new WebError(ErrorCode.UserNotFound, "用户不存在");
});

export {
    infoRouter
}