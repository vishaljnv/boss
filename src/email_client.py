#!/home/vishal/anaconda2/bin/python2.7

import smtplib
import sys
import rpyc

from bson import ObjectId

sys.path.append("..")

from constants import *
sys.path.append(CONFIG_FILE_PATH)
from logger import get_logger

from config import *
from operations import *
from rpyc.utils.server import ThreadedServer

log = get_logger(logFileName="emailClient.log")

class EmailClient(rpyc.Service):

    def on_connect(self):
        con = get_mongo_connection()
        self.db = get_banking_db(con)
        self.me = smtplib.SMTP(host='smtp.gmail.com', port=587)
        self.me.starttls()
        try:
            log.info("Trying login!")
            self.me.login(PROJECT_EMAIL_ID, PROJECT_EMAIL_PASSWORD)
            log.info("Logged in!")
        except Exception, ex:
            log.error("Could not log in to Gmail! Please check internet connectivity.")
            sys.exit(-1)


    def exposed_sendAccountCreatedUpdate(self, user):
        user_type = user["type"]
        if user_type == USER_TYPE_CUSTOMER:
            account = get_account_details_by_username(user["username"])
            if not account:
                raise Exception("Account does not exist")

            name = account["name"]
            email_id = account["email"]
        if user_type == USER_TYPE_TELLER:
            employee = get_employee_details_by_username(user["username"])
            if not employee:
                raise Exception("Employee details not found")

            name = employee["name"]
            email_id = employee["email"]

        msg = get_account_created_template()
        msg_body = msg.substitute(NAME=name.title(), USERNAME=user["username"], PASSWORD=user["password"])
        message = 'Subject: {}\n\n{}'.format("Congratulations! You're all set", msg_body)
        self.me.sendmail(PROJECT_EMAIL_ID, email_id, message)


    def exposed_sendTransferUpdate(self, payer, payee):
        accounts = get_accounts_collection(self.db)
        payer_acc = accounts.find_one({"number":int(payer["account_number"])})

        name = payer_acc["name"]
        payee_acc_num = payee["account_number"]
        payee_acc = accounts.find_one({"number":int(payee_acc_num)})

        sent_msg = get_money_sent_template()
        sent_msg_body = sent_msg.substitute(PAYER_NAME=name.title(), PAYEE_NAME=payee_acc["name"].title(), 
                                            DATE=payer["date"], AMOUNT="$"+str(payer["debits"]), FEES='0',
                                            MODE=payer["mode"])

        rcvd_money = get_money_received_template()
        rcvd_msg_body = rcvd_money.substitute(PAYER_NAME=name.title(), PAYEE_NAME=payee_acc["name"].title(), 
                                              DATE=payee["date"], AMOUNT="$"+str(payee["credits"]),
                                              MODE=payee["mode"])

        message = 'Subject: {}\n\n{}'.format("You sent money", sent_msg_body)
        self.me.sendmail(PROJECT_EMAIL_ID, payer_acc["email"], message)

        message = 'Subject: {}\n\n{}'.format("You received money", rcvd_msg_body)
        self.me.sendmail(PROJECT_EMAIL_ID, payee_acc["email"], message)


    def exposed_sendDepositUpdate(self, deposit):
        accounts = get_accounts_collection(self.db)
        account = accounts.find_one({"number":deposit["account_number"]})

        msg = get_money_deposit_template()
        msg_body = msg.substitute(CUSTOMER=account["name"].title(), DATE=deposit["date"],
                                  AMOUNT="$"+str(deposit["credits"]), MODE=deposit["mode"])

        message = 'Subject: {}\n\n{}'.format("You received money", msg_body)
        self.me.sendmail(PROJECT_EMAIL_ID, account["email"], message)


    def exposed_sendWithdrawUpdate(self, withdraw):
        accounts = get_accounts_collection(self.db)
        account = accounts.find_one({"number":withdraw["account_number"]})

        msg = get_money_withdraw_template()
        msg_body = msg.substitute(CUSTOMER=account["name"].title(), DATE=withdraw["date"], 
                                  AMOUNT="$"+str(withdraw["debits"]), MODE=withdraw["mode"])

        message = 'Subject: {}\n\n{}'.format("You withdrew money", msg_body)
        self.me.sendmail(PROJECT_EMAIL_ID, account["email"], message)


    def __del__(self):
        log.info("logging out. Good bye!")
        self.me.quit() #Terminate SMTP session

if __name__ == '__main__':
    t = ThreadedServer(EmailClient, port=EMAIL_SERVICE_PORT)
    t.start()
