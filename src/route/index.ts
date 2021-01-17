import * as express from 'express';
import { register } from './newregister';
import { infoRouter } from './newinfo';
import * as _ from 'lodash';
import { logger } from '../utils'

const router = express.Router();

router.get('/',(req:express.Request, res: express.Response, _next: express.NextFunction ) => {
    if(_.get(req.session, 'userinfo')) {
        logger.debug('user have loggined');
        return res.redirect("/info");
    }
    logger.debug('user havn\'t loggined');
    return res.redirect("/newregister");
});

router.use('/newregister', register);
router.use('/info', infoRouter);

export {
    router
}
