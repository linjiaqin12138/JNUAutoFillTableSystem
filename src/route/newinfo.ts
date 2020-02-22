import * as express from 'express';
import {db} from '../db';
import {buildInsertQuery,buildSelectQuery, addDoubleQuotesForValue, buildUpdateQuery} from '../utils';
const infoRouter = express.Router();
function checkLogin(req,res,next){
    if(!req.session.userinfo) return res.redirect('/newregister');
    else next();
}
infoRouter.get('/',checkLogin,async (req:any,res,next)=>{
    let result = await db.queryOnce("select * from LoginData where user="+addDoubleQuotesForValue(req.session.userinfo));
    
    console.log("query info", result[0]);
    res.render('info',{
        stuNum: result[0]['user'],
        email: result[0]['Email'],
    });
   
});

export {
    infoRouter
}