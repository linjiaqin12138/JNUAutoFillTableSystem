import * as express from 'express';
import {register} from './newregister';
import {infoRouter} from './newinfo';
const router = express.Router();

router.get('/',(req:any,res,next)=>{
    if(req.session.userinfo) {
        res.redirect("/newinfo");
    }else{
        res.redirect("/newregister");
    }
});

router.use('/newregister',register);
router.use('/newinfo',infoRouter);
// router.use('/info',infoRouter);

export {
    router
}
