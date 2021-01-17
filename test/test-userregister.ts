import { StuInfo } from '../src/route/newregister'
import * as request from 'supertest';
import { expect } from 'chai';
import { app } from '../src/app';
import { querySync } from '../src/db';
import { decryptPassWord, logger } from '../src/utils'

const userData: StuInfo = {
    user: 'fake-user',
    password: 'fake-password',
    email: 'fake@qq.com'
}

function parseCookie(strWithCookie: string): string {
    const end = strWithCookie.indexOf(' Path=/');
    return strWithCookie.substring(0, end);
}
describe('用户注册与登录测试', () => {
    let cookie: string = '';
    before(async () =>{
        const sql = 'delete from LoginData';
        await querySync(sql);
    });
    it('访问主页，没有登陆过，跳转到注册登录页面', async () => {
        const rsp = await request(app)
            .get('/')
            .expect(302);
        expect(rsp.headers['location']).to.be.equals('/newregister');
    });
    it('账号密码登录数字暨大成功，塞进数据库, 密码加密, 设置cookie, 重定向到/info', async () => {
        const rsp = await request(app)
            .post('/newregister')
            .send(userData)
            .expect(302);
        expect(rsp.headers['set-cookie']).to.be.not.empty;
        expect(rsp.headers['location']).to.be.equals('/info');
        expect(await querySync('select * from LoginData')).to.have.length(1);
        logger.debug('cookie: ', rsp.headers['set-cookie'])
        cookie = parseCookie(rsp.headers['set-cookie'][0]);
        logger.debug('parsed cookie: ', cookie);
        const rsp2 = await request(app)
            .get('/newregister')
            .set('Cookie', cookie)
            .send()
            .expect(302);
        expect(rsp2.headers['location']).to.be.equals('/info');
    });

    it('用户已经存在，跳转到用户信息页面', async () => {
        const rsp = await request(app)
            .post('/newregister')
            .send(userData)
            .expect(302);
        expect(rsp.headers['location']).to.be.equals('/info');
    });

    it('账号密码登录数字暨大失败，返回401', async () => {
        const rsp = await request(app)
            .post('/newregister')
            .send({ ...userData, password: 'error' })
            .expect(401);
        expect(rsp.body).to.be.deep.equals({
            errorCode: '1',
            errorMsg: '登录数字暨大失败，请检查学号密码是否正确'
        });
    });

    it('用户已经存在，邮箱变更，更新数据库', async () => {
        const sql = `update LoginData set email="test@qq.com" where user="${userData.user}"`;
        await querySync(sql);
        const rsp = await request(app)
            .post('/newregister')
            .send(userData)
            .expect(302);
        expect(rsp.headers['set-cookie']).to.be.not.empty;
        expect(rsp.headers['location']).to.be.equals('/info');
        const updatedResult = await querySync('select * from LoginData');
        expect(updatedResult[0].email).to.be.equal(userData.email);updatedResult[0].password
        expect(decryptPassWord(updatedResult[0].password)).to.be.equal(userData.password);
    });

    it('用户访问用户信息界面，没有登录过，跳转到注册和登录界面', async () => {
        const rsp = await request(app)
            .get('/info')
            .send(userData)
            .expect(302);
        expect(rsp.headers['location']).to.be.equals('/newregister');
    });

    it('用户访问用户信息界面，登录过，返回用户信息界面', async () => {
        await request(app)
            .get('/info')
            .set('Cookie', cookie)
            .send(userData)
            .expect(200);
    });
})