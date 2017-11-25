#!/home/vishal/anaconda2/bin/python2.7

import socket
import json
import sys
import getopt
import uuid
import datetime

sys.path.append("..")

from thread import *
from constants import *
from logger import get_logger

sys.path.append(CONFIG_FILE_PATH)
from config import *
from operations import *

log = get_logger(logFileName="socketServer.log")

def passiveTCP(port):
    sock = socket.socket()
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind(("0.0.0.0",port))
    sock.listen(10)

    return sock


def main():
    try:
        optlist, args = getopt.getopt(sys.argv[1:], "p:")
    except getopt.GetoptError as err:
        log.error(str(err))
        usage()
        sys.exit(-1)

    port = SOCKET_SERVER_PORT
    for opt, arg in optlist:
        if opt == '-p':
            port = int(arg)

    sock = passiveTCP(port)
    while True:
        con, addr = sock.accept()
        start_new_thread(handleClient,(con,))


def usage():
    log.info('/server.py -p port')


def get_account_summary(request):
    if "username" in request:
        return get_account_summary_by_username(request["username"])
    if "account_number" in request:
        return get_account_summary_by_account_number(request["account_number"])


def create_new_account(request):
    msg = {}
    if request["user_type"] == USER_TYPE_TELLER:
        user = create_teller_account(request["name"], request["email"])
    if request["user_type"] == USER_TYPE_CUSTOMER:
        account, user = create_customer_account(request["account_type"], request)

    mailer.root.sendAccountCreatedUpdate(user)
    msg["result"] = "passed"
    msg["errmsg"] = "success"
    return msg


def delete_account(request):
    msg = {}
    user_type = request.get("user_type")
    if user_type == USER_TYPE_CUSTOMER:
        acc_num = request.get("account_number")
        if not account_number_exists(acc_num):
            raise Exception("Account does not exist!")

        username = get_username_of_the_account(acc_num)
        delete_bank_acccount(acc_num)
    elif user_type == USER_TYPE_TELLER:
        employee_id = request.get("employee_id")
        username = get_username_of_employee(employee_id)
        if not username_exists(username):
            raise Exception("Employee details not found!")

        delete_employee_account(employee_id)

    delete_user_acccount(username)
    msg["result"] = 'passed'
    msg["errmsg"] = 'success'
    return msg


def freeze_account(request):
    msg = {}
    acc_num = request.get("account_number")
    if not account_number_exists(acc_num):
        raise Exception("Account does not exist!")

    put_bank_account_on_hold(acc_num)

    msg["result"] = 'passed'
    msg["errmsg"] = 'success'
    print "Returning:",msg
    return msg


def reactivate_account(request):
    msg = {}
    acc_num = request.get("account_number")
    if not account_number_exists(acc_num):
        raise Exception("Account does not exist!")

    reactivate_bank_account(acc_num)
    msg["result"] = 'passed'
    msg["errmsg"] = 'success'
    return msg


def validate_funds_transfer(request):
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

    if is_account_on_hold(payer_acc["number"]):
        msg["errmsg"] = 'Your account is put on hold. Contact Admin.'
        msg["result"] = 'failed'
        return msg

    if is_account_on_hold(payee_acc_num):
        msg["errmsg"] = 'Payee account put on hold'
        msg["result"] = 'failed'
        return msg

    if get_account_balance(payer_acc["number"]) < amount:
        msg["errmsg"] = 'Insufficient funds'
        msg["result"] = 'failed'
        return msg

    if exceeds_daily_transfer_limit(payer_account_type, amount):
        msg["errmsg"] = 'This transaction exceeds daily transaction limit'
        msg["result"] = 'failed'
        return msg

    msg["result"] = 'passed'
    return msg


def transfer(request):
    msg = {}
    payer_update = {}
    payee_update = {}

    username = request.get("username")
    payer_acc = get_account_details_by_username(username)
    payee_acc = get_account_details_by_account_number(request["account_number"])
    amount = request["amount"]

    validation = validate_funds_transfer(request)
    if validation["result"] != 'passed':
        return validation

    log.debug("Transfering $%d from %d to %d"%(amount, payer_acc["number"], payee_acc["number"]))
    payer_update["account_number"] = payer_acc["number"]
    payer_update["type"] = TRANSACTION_TYPE_TRANSFER
    payer_update["credits"] = 0
    payer_update["debits"] = amount
    payer_update["date"] = datetime.datetime.today().strftime("%m/%d/%y")
    payer_update["mode"] = "Online Transfer"

    payee_update["account_number"] = payee_acc["number"]
    payee_update["type"] = TRANSACTION_TYPE_TRANSFER
    payee_update["credits"] = amount
    payee_update["debits"] = 0
    payee_update["date"] = datetime.datetime.today().strftime("%m/%d/%y")
    payee_update["mode"] = "Online Transfer"

    payee_new_balance = payee_acc["balance"] + amount
    payer_new_balance = payer_acc["balance"] - amount

    update_account_balance(payee_acc["number"], payee_new_balance)
    update_account_balance(payer_acc["number"], payer_new_balance)

    add_transaction_to_db(payer_update)
    add_transaction_to_db(payee_update)
    mailer.root.sendTransferUpdate(payer_update, payee_update)

    log.debug("Transfered $%d from %d to %d"%(amount, payer_acc["number"], payee_acc["number"]))
    msg["result"] = 'passed'
    msg["errmsg"] = 'Transfer Complete!'
    return msg


def validate_deposit_or_withdraw(request):
    msg = {}

    acc_num = request.get("account_number")
    amount = request["amount"]

    if not account_number_exists(acc_num):
        msg["errmsg"] = 'Invalid account number'
        msg["result"] = 'failed'
        return msg

    account_type =  get_account_type(acc_num)
    if account_type == ACCOUNT_TYPE_DEPOSIT:
        msg["errmsg"] = 'Transfer not allowed to/from deposit account'
        msg["result"] = 'failed'
        return msg

    if is_account_on_hold(acc_num):
        msg["errmsg"] = 'Account put on hold'
        msg["result"] = 'failed'
        return msg

    if exceeds_daily_transfer_limit(account_type, amount):
        msg["errmsg"] = 'This transaction exceeds daily transaction limit'
        msg["result"] = 'failed'
        return msg

    msg["result"] = 'passed'
    return msg


def deposit(request):
    msg = {}
    acc_num = request.get("account_number")
    amount = request["amount"]

    validation = validate_deposit_or_withdraw(request)
    if validation["result"] != 'passed':
        return validation

    transaction = {}
    transaction["account_number"] = acc_num
    transaction["type"] = TRANSACTION_TYPE_DEPOSIT
    transaction["credits"] = amount
    transaction["debits"] = 0
    transaction["date"] = datetime.datetime.today().strftime("%m/%d/%y")
    transaction["mode"] = "Cash Deposit"

    cur_bal = get_account_balance(acc_num)
    new_balance = cur_bal + amount
    update_account_balance(acc_num, new_balance)

    add_transaction_to_db(transaction)
    mailer.root.sendDepositUpdate(transaction)
    msg["result"] = 'passed'
    msg["errmsg"] = 'Deposit Complete!'
    return msg


def withdraw(request):
    msg = {}
    acc_num = request.get("account_number")
    amount = request["amount"]

    validation = validate_deposit_or_withdraw(request)
    if validation["result"] != 'passed':
        return validation

    if get_account_balance(acc_num) < amount:
        msg["errmsg"] = 'Insufficient funds'
        msg["result"] = 'failed'
        return msg

    transaction = {}
    transaction["account_number"] = acc_num
    transaction["type"] = TRANSACTION_TYPE_WITHDRAW
    transaction["credits"] = 0
    transaction["debits"] = amount
    transaction["date"] = datetime.datetime.today().strftime("%m/%d/%y")
    transaction["mode"] = "Cash Withdraw"

    cur_bal = get_account_balance(acc_num)
    new_balance = cur_bal - amount

    update_account_balance(acc_num, new_balance)

    add_transaction_to_db(transaction)
    mailer.root.sendWithdrawUpdate(transaction)

    msg["result"] = 'passed'
    msg["errmsg"] = 'Withdraw Complete!'
    return msg


def get_teller_details(request):
    msg = {}
    employee_id = request.get("employee_id")
    employee = get_employee_details(employee_id)
    if not employee:
        raise Exception("Employee details not found")

    del employee["_id"]
    msg["data"] = employee
    msg["result"] = 'passed'
    msg["errmsg"] = 'success'
    return msg


def handleClient(con):
    response = {}
    try:
        request = get_data_from_peer(con)
        if not request:
            log.error("get request failed!")

        cmd = request.get('cmd')
        if cmd == CMD_CREATE_ACCOUNT:
            response = create_new_account(request)
        elif cmd == CMD_DELETE_ACCOUNT:
            response = delete_account(request)
        elif cmd == CMD_FREEZE_ACCOUNT:
            response = freeze_account(request)
        elif cmd == CMD_REACTIVATE_ACCOUNT:
            response = reactivate_account(request)
        elif cmd == CMD_GET_ACCOUNT_SUMMARY:
            response = get_account_summary(request)
        elif cmd == CMD_GET_TELLER_DETAILS:
            response = get_teller_details(request)
        elif cmd == CMD_TRANSFER_FUNDS:
            response = transfer(request)
        elif cmd == CMD_DEPOSIT_FUNDS:
            response = deposit(request)
        elif cmd == CMD_WITHDRAW_FUNDS:
            response = withdraw(request)

    except Exception, ex:
        error = str(ex)
        response = {"errmsg":error,"result":"failed", "data":None}
        log.error(error)

    if response:
        send_data_to_peer(con, response)


if __name__ == '__main__':

    mailer = get_connection_to_email_service()
    if not mailer:
        log.debug("Could not connect to mail Service on any host!")
        sys.exit(-1)

    main()
