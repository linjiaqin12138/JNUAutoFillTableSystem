import os
if __name__=='__main__':
    Time = {'h': 6,'m': 0}
    while True:
        while True:
            now = datetime.datetime.now()
            if now.hour == Time['h'] and now.minute == Time['m']:
                break
            time.sleep(10)
        os.system("python3 fuckjnutest.py")
        time.sleep(100)
