# JNUAutoFillTableSystem
**WARNNING**: 本项目仅限学习交流，部署后请不要将此项目大规模使用，否则被小人举报后果自负。


## 如何运行此项目
### 项目配置
先填好config.json配置文件，注意格式正确

文件中各个参数的说明如下：
`scripts.notification.enabled`: true: 打卡失败时发送邮件通知打卡失败的那个人，该项为此值时notification域下的其它参数才有意义, false: 不启用邮件通知
`scripts.notification.email-address`: 打卡失败发送邮件通知的发送方账号，建议使用163邮箱，其它邮箱没测过
`scripts.notification.passport`: 邮箱的授权码，注意不是邮箱密码
`scripts.notification.title`: 邮件的主题，不要用中文，中文好像会有问题，暂时没有解决中文编码的问题
`scripts.notification.host`: 邮箱的smtp服务器，如果是163服务器就是smtp.163.com
`scripts.notification.port`: smtp服务器端口，163邮箱是465
`database`: 数据库相关配置，在docker中运行时内容跟下面的示例保持一致即可，不要修改
`web.port`: 网站的访问端口
`web.encrypt-key`: 数据库中保存的用户密码的加密密钥，加入数据库被黑了，人家打开数据库看到的都是密文
示例如下
```json
{
    "scripts": {
        "notification": {
            "enabled": true,
            "email-address": "example@163.com",
            "passport": "example",
            "title": "Health Check Failed Notification",
            "host": "smtp.163.com",
            "port": 465
        }
    },
    "database": {
        "host": "mysql",
        "port": "3306",
        "db-name": "JNUSTU",
        "user": "root",
        "password": "secret"
    },
    "web": {
        "port": 3000,
        "encrypt-key": "jnu"
    }
}
```
### 运行项目
找一台24小时运行的机子做服务器，安装好docker，到项目路径下执行`docker-compose up -d`即可运行

## 求打赏维护项目
