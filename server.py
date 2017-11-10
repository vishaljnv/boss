#!/home/vishal/anaconda2/bin/python2.7

import socket
import json
import sys
import getopt
import uuid

from thread import *
from constants import *
from config import *
from utils import *

mongoConection = get_mongo_connection()

def passiveTCP(port):
    sock = socket.socket()
    sock.bind(("0.0.0.0",port))
    sock.listen(10)

    return sock


def main():
    try:
        optlist, args = getopt.getopt(sys.argv[1:], "p:")
    except getopt.GetoptError as err:
        print str(err)
        usage()
        sys.exit(-1)

    port = SERVER_PORT
    for opt, arg in optlist:
        if opt == '-p':
            port = int(arg)

    sock = passiveTCP(port)
    while True:
        con, addr = sock.accept()
        start_new_thread(handleClient,(con,))


def usage():
    print '/server.py -p port'


def get_account_smmary(request):
    if "username" in request:
        return get_account_summary_by_username(request["username"])
    if "account_number" in request:
        return get_account_summary_by_account_number(request["account_number"])


def create_new_account(request):
    msg = {}
    if request["user_type"] == 'teller':
        user = create_teller_account(request["name"], request["email"])
    if request["user_type"] == 'customer':
        account, user = create_customer_account(request["account_type"], request["name"], request["email"])

    msg["result"] = 'success'
    return msg


def delete_account(request):
    username = request.get("username")
    account = get_account_details_by_username(username)
    if not username_exists(username):
        raise Exception("User account does not exist!")

    delete_bank_acccount_by_username(username)
    delete_user_acccount_by_username(username)


def freeze_account(request):
    username = request.get("username")
    account = get_account_details_by_username(username)
    if not username_exists(username):
        raise Exception("User account does not exist!")

    put_account_on_hold_by_username(username)


def transfer(request):
    msg = {}

    username = request.get("username")
    payer_acc = get_account_details_by_username(username)

    payee_acc_num = request["account_number"]
    payee_acc = get_account_details_by_account_number(payee_acc_num)

    amount = request["amount"]

    if not username_exists(username):
        raise Exception("User account does not exist!")

    payer_account_type = payer_acc["type"]
    payee_account_type = payee_acc["type"]
    if not payee_acc:
        msg["errmsg"] = 'Invalid Payee account number'
        msg["result"] = 'failed'
        return msg

    if payer_account_type == ACCOUNT_TYPE_DEPOSIT or payee_account_type == ACCOUNT_TYPE_DEPOSIT:
        msg["errmsg"] = 'Transfer not allowed to/from deposit account'
        msg["result"] = 'failed'
        return msg

    if is_account_on_hold(username):
        msg["errmsg"] = 'Account put on hold'
        msg["result"] = 'failed'
        return msg

    if exceeds_daily_transfer_limit(account_type, amount)
        msg["errmsg"] = 'This transaction exceeds daily transfer limit'
        msg["result"] = 'failed'
        return msg

    payee_new_balance = payee_acc["balance"] + amount
    payer_new_balance = payer_acc["balance"] - amount

    add_transaction_to_db()


def handleClient(con):
    request = get_data_from_peer(con)
    if not request:
        print "get request failed!"

    cmd = request.get('cmd')
    if cmd == 'CreateAccount':
        response = create_account(request)
    elif cmd == 'DeleteAccount':
        response = delete_account(request)
    elif cmd == 'FreezeAccount':
        response == freeze_account(request)
    elif cmd == 'AccountSummary':
        response = get_account_summary(request)
    elif cmd == 'TransferFunds':
        response = transfer(request)
    elif cmd == 'DepositFunds':
        response = deposit(request)
    elif cmd == 'WithdrawFunds':
        response = withdraw(request)

    if response:
        send_data_to_peer(con, response)


if __name__ == '__main__':
    main()
