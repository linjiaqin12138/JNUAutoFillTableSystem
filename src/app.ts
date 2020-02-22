import * as express from 'express';
import * as session from 'express-session';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as path from 'path';
import {router} from './route';
const app = express();

app.set('views',path.join(__dirname,'../../views'));

console.log("root directory is ",path.join(__dirname,'../views'));

app.set('view engine','jade');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use(session({
    secret: "*******",
    cookie: {maxAge: 60*1000*30},
    resave: true, // force to save session
    saveUninitialized: false // force save session which havn't been saved
}))
app.use(router);
app.use('/static',express.static(path.join(__dirname,'../../public')));

app.use((err,req,res:express.Response,next)=>{
    console.error(err);
    res.status(500).render('error');
})

export{
    app
}
