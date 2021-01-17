import * as log from 'logger';
import * as path from 'path';
import * as crypto from 'crypto-js'
import { config } from '../config';
const logPath = process.env.ENV === 'production' ? '/var/log/jnuHealthCheck/web.log' : path.join(process.cwd(), './log/web.log');
export const logger = log.createLogger(logPath);
logger.setLevel('debug');
const secret = config.get('web.encrypt-key');

export function encryptPassWord(pass: string): string {
    return crypto.AES.encrypt(pass, secret).toString();
}

export function decryptPassWord(encrypted: string): string {
    return crypto.AES.decrypt(encrypted, secret).toString(crypto.enc.Utf8);
}

export async function comparePassword(pass: string, encrypted: string): Promise<boolean> {
    logger.debug('pass: ', pass, 'encrypted: ', encrypted);
    const decrypted = decryptPassWord(encrypted);
    const isEqual = decrypted === pass ;
    if (isEqual) {
        return true;
    }
    logger.debug('password have been changed!, before: ', decrypted, 'after: ', pass);
    return false;
}
