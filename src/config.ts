import * as fs from 'fs';
import * as _ from 'lodash';

const targetUrl = "https://ehall.jnu.edu.cn/infoplus/form/XNYQSB/start";
const ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36"
const loginUrl = "http://icas.jnu.edu.cn/cas/login"

interface ProjectConfig {
    web: {
        port: number,
        'encrypt-key': string
    },
    database: {
        host: string,
        port: number,
        'db-name': string,
        user: string,
        password: string
    }
    [ key:string ]: any
}

export function readJsonConfigFile(filePath: string): ProjectConfig {
    const jsonStr = fs.readFileSync(filePath).toString();
    return JSON.parse(jsonStr);
}

class Config {
    private projectConfig: ProjectConfig = readJsonConfigFile('./config.json');
    constructor() {}
    get(field: string) {
        return _.get(this.projectConfig, field)
    }
}

const config = new Config();
export {
    config,
    targetUrl,
    ua,
    loginUrl as LOGINURL
}