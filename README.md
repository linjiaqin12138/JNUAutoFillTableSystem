# JNUAutoFillTableSystem
Reject meanless table filling which is asked by Jinan University for preventing cornovirus.

## How to run this project 
Be sure that your server have install `nodejs`, `python3` , `mysql` with the latest version.

Login to your mysql server, run the commands in the `DATABASE.sql` to create the database and tables. Set the infomation of your mysql server from line 3 to 8 in the `/src/db.ts`.

Run the following command to install the dependencies required by this project.

```bash
pip install -r requirements
npm install
```

Open a new terminal and run `npm build && npm start`.
Open a new terminal and run `python3 ./fuckjnu.py`

## How this project work
The web program ask user for the school network account and password for login to the school website. The code will use the account and password to try to login and judge whether the account is valid by reponse from school website. If the account is valid, it will jump to info-filling panel to ask user for information to fill his health check table. All of the information will be save into the database for the `fuckjnu.py` script. 

The `fuckjnu.py` script read the user data in database, drive and control the browser to fill the health check form at 6:00 everyday.