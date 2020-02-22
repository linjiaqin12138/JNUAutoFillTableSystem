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

class TableRobot:
    key = None
    BASEURL = "https://stuhealth.jnu.edu.cn"
    ctx = None
    db = pymysql.connect("aliyun.linjiaqin.xyz","root","toor","JNUSTU")

    def __init__(self):
        js = open("crypto.js","r")
        self.ctx = execjs.compile(js.read())
        js.close()
    def sendMail(self,user):
        sender = 'jiaqinlin12138@163.com'
        receiver = user['email']
        title = "今日填表结果"
        message = "今天的填表已经完成，请查收" + user['link']
        pw = "linjiaqin12306"
        smtp = SMTP_SSL('smtp.163.com',465)
        smtp.login(sender,pw)
        msg = MIMEText(message,"plain",'utf-8')
        msg["Subject"] = Header(title,'utf-8')
        msg["From"] = sender
        msg["To"] = receiver
        smtp.sendmail(sender, receiver, msg.as_string())
        smtp.quit()
    def header(self):
        return {'Content-Type': "application/json"}
    def readDatabase(self):
        cursor = self.db.cursor()
        counts = cursor.execute("select * from LoginData")
        userAccount = cursor.fetchall()
        result = []
        for user in userAccount:
            cursorForInfo = self.db.cursor()
            if(cursorForInfo.execute("select * from UserInfo where user=\'" + user[0]+"\'") > 1):
                raise Exception("Error: no less than one user info")
            userinfo = cursorForInfo.fetchone()
            oneuser = {
                'user': user[0],
                'password': user[1],
                'email': user[2]
            }
            print(oneuser)
            result.append(oneuser)
        return result
    def login(self,user):
        username = user["user"]
        password = self.ctx.call('encrypt',self.key,user["password"])
        res = requests.post(self.BASEURL + "/api/user/login",headers=self.header(),json = {'username': username, 'password': password})
        jnuid = json.loads(res.text)['data']['jnuid']
        return jnuid
    def task(self):
        html = requests.get(self.BASEURL + "/#/login")
        jslink = re.findall('src=\"main(.*?).js\"',html.text)[0]
        jslink = self.BASEURL + "/main" + jslink + ".js"
        html = requests.get(jslink)
        self.key = re.findall('this.CRYPTOJSKEY=\"(.*?)\"',html.text)[0]
        userList = self.readDatabase()
        for user in userList:
            user['link'] = self.fillTable(user)
            self.sendMail(user)
    def getInfo(self,jnuid):
        return requests.post(
            self.BASEURL + "/api/user/stuinfo",
            headers=self.header(),
            json = {
                "jnuid": jnuid,
                "idType": "1"
            }
        )
    def fillTable(self,user):
        jnuid = self.login(user)
        postInfo = json.loads(self.getInfo(jnuid).text)
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
        return requests.post(
            self.BASEURL + "/api/write/main",
            headers=self.header(),
            json = dataToPost
        ).text
        


if __name__=='__main__':
    Time = {'h': 6,'m': 0}
    robot = TableRobot()
    while True:
        while True:
            now = datetime.datetime.now()
            if now.hour == Time['h'] and now.minute == Time['m']:
                break
            time.sleep(10)
        robot.task()
        time.sleep(100)

# robot = TableRobot()

# robot.task()
