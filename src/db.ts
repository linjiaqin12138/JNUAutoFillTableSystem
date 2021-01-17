import * as mysql from 'mysql';
import { config } from './config';
import { logger } from './utils';

interface LoginData {
    user: string,
    password: string,
    email: string
}
const dbConfig = {
    host: config.get('database.host') || 'mysql',
    user: config.get('database.user'),
    password: config.get('database.password'),
    database: config.get('database.db-name')
}
const connection = mysql.createConnection(dbConfig);

connection.connect((err: any, result: any)=>{
    logger.debug(JSON.stringify(dbConfig));
    if(err) logger.debug(`Fail to connect database`);
    else logger.debug(JSON.stringify(result));
});

async function querySync(sql: string): Promise<any[]>{
    return new Promise<Array<any>>((resolve, reject) => {
        connection.query(sql, (err: any, result: any)=>{
            if(err) reject(err);
            else{
                resolve(result);
            }
        })
    });
}

async function createTable(): Promise<void> {
    logger.debug('create table.......');
    await querySync('CREATE TABLE IF NOT EXISTS `LoginData` (\n' +
        'user CHAR(10) PRIMARY KEY, \n' +
        'password VARCHAR(100) NOT NULL, \n' +
        'email VARCHAR(20) NOT NULL \n' +
    ') ENGINE=InnoDB DEFAULT CHARSET=utf8')
}

createTable();

export {
    querySync,
    LoginData,
    connection
}