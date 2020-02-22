import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import {db} from '../db';
import {buildInsertQuery,buildSelectQuery, addDoubleQuotesForValue, buildUpdateQuery} from '../utils';
const infoRouter = express.Router();
function checkLogin(req,res,next){
    if(!req.session.userinfo) return res.redirect('/static/register.html');
    else next();
}
infoRouter.get('/infochange',checkLogin,(req,res,next)=>{
    res.set({'Content-type': 'text/html'});
    res.send(fs.readFileSync(path.join(__dirname,"../../../public/infochange.html")).toString());
})
infoRouter.post('/infochange',checkLogin,async (req:any,res,next)=>{
    const columns = ["user","teacherName","class","contactName","contactPhone","province","city","area","road"];
    const values = [
        req.session.userinfo,
        req.body.teacher,
        req.body.class,
        req.body.ergenContact,
        req.body.ergenPhone,
        req.body.province,
        req.body.city,
        req.body.area,
        req.body.road
    ];
    const sql = buildUpdateQuery("UserInfo",columns,values,"where user=" + addDoubleQuotesForValue(req.session.userinfo));
    console.log(sql);
    await db.queryOnce(sql);
    res.redirect("/info");
})
infoRouter.get('/',checkLogin,async (req:any,res,next)=>{
    let result = await db.queryOnce("select * from LoginData where user=" + addDoubleQuotesForValue(req.session.userinfo));
    
    res.render('info',{
        stuNum: result[0]['user'],
        email: result[0]['Email'],
        class_: result[0]['class'],
        teacher: result[0]['teacherName'],
        contactName: result[0]['contactName'],
        contactPhone: result[0]['contactPhone'],
        province: result[0]['province'],
        city: result[0]['city'],
        area: result[0]['area'],
        road: result[0]['road']
    });
    
});
infoRouter.get('/infofill',checkLogin, (req:any,res,next)=>{
    res.set({'Content-type': 'text/html'});
    res.send(fs.readFileSync(path.join(__dirname,"../../../public/infofill.html")).toString());
})

infoRouter.post('/infofill', async (req:any,res,next)=>{
    const columns = ["user","teacherName","class","contactName","contactPhone","province","city","area","road"];
    const values = [
        req.session.userinfo,
        req.body.teacher,
        req.body.class,
        req.body.ergenContact,
        req.body.ergenPhone,
        req.body.province,
        req.body.city,
        req.body.area,
        req.body.road
    ];
    const sql = buildInsertQuery("UserInfo",columns,values);
    await db.queryOnce(sql);
    res.redirect("/info");
})
export {
    infoRouter
}