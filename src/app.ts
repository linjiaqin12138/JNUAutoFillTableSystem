import * as express from 'express';
import * as session from 'express-session';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as path from 'path';
import { WebError, errorMapper } from './route/common'
import { router } from './route';
import { logger } from './utils'

const app = express();

app.set('views',path.join(__dirname,'../../views'));
app.set('view engine','jade');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
    secret: "jnuvirustable",
    cookie: { maxAge: 60*1000*30 },
    resave: true, // force to save session
    saveUninitialized: false // force save session which havn't been saved
}));

app.use(router);
app.use('/static', express.static(path.join(__dirname,'../../public')));

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction)=>{
    logger.error(err);
    if (err instanceof WebError) {
        const errorInfo = errorMapper(err);
        return res.status(errorInfo.status).send({
            errorCode: errorInfo.code,
            errorMsg: errorInfo.errorDescription
        });
    }
    return res.status(500).send({
        errorCode: 'ServerError',
        errorMsg: `Unexpected error happened: ${err.message}`
    });
})

export{
    app
}
