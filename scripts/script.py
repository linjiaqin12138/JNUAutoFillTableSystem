# -*- coding: utf-8 -*-        

import time
import datetime
import pymysql
from smtplib import SMTP_SSL
from email.mime.text import MIMEText
from email.header import Header
import execjs
import requests
import re
import json
import logging
# logging.basicConfig(level = print)
def fetchWebContent(url):
    try:
        content = requests.get(url).text
        # print('get web content: ', content)
        return content
    except:
        raise ScriptError('WEB-FETCH-ERR', 'unabled to fetch web content from %s' % url)

def postData(url, data, header):
    try:
        return requests.post(
            url,
            headers=header,
            json = data
        ).text
    except:
        raise ScriptError('DATA-POST-ERR', 'url: %s' % url)
def findTargetString(regexp, content):
    try:
        return re.findall(regexp,content)[0]
    except:
        raise ScriptError('REGEXP-SEARCH-ERR', 'unabled match regexp %s in %s' % (regexp, content))

def readDb(dbConn, sql):
    try:
        cursor = dbConn.cursor()
        counts = cursor.execute("select * from LoginData")
        return cursor.fetchall()
    except:
        raise ScriptError('DB-READ-ERR', sql)

class ScriptError(Exception):
    def __init__(self, code, description):
        super()
        self.errorCode = code
        self.errorDescription = description

class TableRobot:
    key = None
    BASEURL = "https://stuhealth.jnu.edu.cn"
    ctx = None
    
    def __init__(self):
        jsFilePath = "./scripts/crypto.js"
        configPath = "./config.json"
        encryptScript = None
        configFile = None
        try:
            encryptScript = open(jsFilePath,"r")
            configFile = open(configPath, 'r')
            self.config = json.loads(configFile.read())
            self.ctx = execjs.compile(encryptScript.read())
            self.db = pymysql.connect(
                self.config['database']['host'],
                self.config['database']['user'],
                self.config['database']['password'],
                self.config['database']['db-name']
            )
        except:
            if encryptScript: encryptScript.close()
            if configFile: configFile.close()
            raise ScriptError('FILE-READ-ERR', '')
    def sendMail(self,user, failReason = "未知错误"):
        try:
            notifConfig = self.config['scripts']['notification']
            print(notifConfig)
            if notifConfig['enabled']:
                sender = notifConfig['email-address'] 
                receiver = user['email']
                title = notifConfig['title']
                message = failReason
                pw = notifConfig['passport']
                smtp = SMTP_SSL(notifConfig['host'], notifConfig['port'])
                smtp.login(sender,pw)
                msg = MIMEText(message,"plain",'utf-8')
                msg["Subject"] = Header(title,'utf-8')
                msg["From"] = sender
                msg["To"] = receiver
                smtp.sendmail(sender, receiver, msg.as_string())
                smtp.quit()
        except:
            raise ScriptError('EMAIL-SEND-ERR', 'failed to send error email notification')

    def header(self):
        return {'Content-Type': "application/json"}
    def readDatabase(self):
        try:
            userAccount = readDb(self.db, 'select * from LoginData')
            result = []
            for user in userAccount:
                oneuser = {
                    'user': user[0],
                    'password': self.ctx.call('decryptPasswordFromDb', user[1]),
                    'email': user[2]
                }
                print('get one user info: ', oneuser)
                result.append(oneuser)
            return result
        except:
            raise ScriptError('DB-READ-ERR', 'failed to read users from dababase')
    def getJnuId(self,user):
        try:
            username = user['user']
            password = self.ctx.call('encrypt',self.key,user['password'])
            res = postData(
                self.BASEURL + "/api/user/login",
                {'username': username, 'password': password},
                self.header()
            )
            jnuid = json.loads(res)['data']['jnuid']
            return jnuid
        except:
            raise ScriptError('JNUID-FETCH-ERR', '获取JNUID失败，可能你不需要打卡了？')

    def getCryptojsKey(self):
        url = self.BASEURL + "/#/login"
        webContent = fetchWebContent(url)
        jslink = findTargetString('src=\"main(.*?).js\"', webContent)
        jslink = self.BASEURL + "/main" + jslink + ".js"
        print('js link: ', jslink)
        webContent = fetchWebContent(jslink)
        return findTargetString('this.CRYPTOJSKEY=\"(.*?)\"', webContent)
        
    def start(self):
        try:
            self.key = self.getCryptojsKey()
            print('get key: ', self.key)
            userList = self.readDatabase()
            for user in userList:
                self.fillTable(user)
        except ScriptError as err:
            print('error Happened with error code: %s, description: %s' % (err.errorCode, err.errorDescription))
            logging.exception(err)
        except Exception as unexpectedEror:
            print('Unexpected Error Happpended')
            logging.exception(unexpectedEror)
        finally:
            exit()

    def getInfo(self,jnuid):
        return postData(
            self.BASEURL + "/api/user/stuinfo",
            {
                "jnuid": jnuid,
                "idType": "1"
            },
            self.header()
        )
    def fillTable(self,user):
        try:
            print('current user is: ', user)
            jnuid = self.getJnuId(user)
            postInfo = json.loads(self.getInfo(jnuid))
            mainTable = postInfo["data"]["mainTable"]
            dataToPost = {
                "mainTable": {
                    "wayStart": mainTable["wayStart"],
                    "arriveTime": mainTable["arriveTime"],
                    "way2Start": mainTable["way2Start"],
                    "language": "cn",
                    "declareTime": postInfo["data"]["declare_time"],
                    "personNo": mainTable["personNo"],
                    "personName": postInfo["data"]["xm"],
                    "sex": postInfo["data"]["xbm"],
                    "professionName": postInfo["data"]["zy"],
                    "collegeName": postInfo["data"]["yxsmc"],
                    "phoneArea": mainTable["phoneArea"],
                    "phone": mainTable["phone"],
                    "assistantName": mainTable["assistantName"],
                    "assistantNo": mainTable["assistantNo"],
                    "className": mainTable["className"],
                    "linkman": mainTable["linkman"],
                    "linkmanPhoneArea": mainTable["linkmanPhoneArea"],
                    "linkmanPhone": mainTable["linkmanPhone"],
                    "personHealth": mainTable["personHealth"],
                    "temperature": mainTable["temperature"],
                    "personHealth2": mainTable["personHealth2"],
                    "personState2": mainTable["personState2"],
                    "leaveState": mainTable["leaveState"],
                    "leaveHubei": mainTable["leaveHubei"],
                    "wayType1": mainTable["wayType1"],
                    "wayType2": mainTable["wayType2"],
                    "wayType3": mainTable["wayType3"],
                    "wayType5": mainTable["wayType5"],
                    "wayType6": mainTable["wayType6"],
                    "wayNo": mainTable["wayNo"],
                    "currentArea": mainTable["currentArea"],
                    "inChina": mainTable["inChina"],
                    "personC1id": mainTable["personC1id"],
                    "personC1": mainTable["personC1"],
                    "personC2id": mainTable["personC2id"],
                    "personC2": mainTable["personC2"],
                    "personC3id": mainTable["personC3id"],
                    "personC3": mainTable["personC3"],
                    "personC4": mainTable["personC4"],
                    "otherC4": mainTable["otherC4"],
                    "isPass14C1": mainTable["isPass14C1"],
                    "isPass14C2": mainTable["isPass14C2"],
                    "isPass14C3": mainTable["isPass14C3"]
                },
                "jnuid": jnuid
            }
            return postData(
                self.BASEURL + "/api/write/main",
                dataToPost,
                self.header()
            )
        except ScriptError as se:
            self.sendMail(user, '错误码：%s, 错误描述：%s' % (se.errorCode, se.errorDescription))
        except:
            self.sendMail(user)
        

robot = TableRobot()

robot.start()