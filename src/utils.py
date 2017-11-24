import socket
import json
import errno
import pymongo
import sys

from constants import *
from config import *

def get_data_from_peer(con):
    request = None
    try:
        data = con.recv(4096)
        request = json.loads(data)
    except socket.error as se:
        print str(se)
        if se.errno == errno.CONNRESET:
            print "Client died!"
    except Exception, ex:
        print str(ex)
        return None

    return request


def send_data_to_peer(con, data):
    request = None
    try:
        n = con.send(json.dumps(data))
    except socket.error as se:
        print str(se)
        if se.errno == errno.CONNRESET:
            print "Client died!"
    except Exception, ex:
        print str(ex)
        return -1

    return 0


def get_connection_to_server():
    sock = socket.socket()
    sock.connect((SERVER_IP, SERVER_PORT))
    return sock


def send_command_to_server(cmd):
    error = None
    try:
        server = get_connection_to_server()
        send_data_to_peer(server, cmd)
    except Exception, ex:
        error = str(ex)

    return server, error


def get_mongo_connection():
    return pymongo.MongoClient()


def get_banking_db(mongo_con):
    return mongo_con[DB_NAME]


def get_accounts_collection(db):
    return db[ACCOUNTS_COLLECTION_NAME]


def get_employees_collection(db):
    return db[EMPLOYEES_COLLECTION_NAME]


def get_users_collection(db):
    return db[USERS_COLLECTION_NAME]


def get_account_types_collection(db):
    return db[ACCOUNT_TYPES_COLLECTION_NAME]


def get_transactions_collection(db):
    return db[TRANSACTIONS_COLLECTION_NAME]


def account_number_exists(acc_num):
    return bool(accounts.find_one({"number":acc_num}))


def username_exists(username):
    return bool(accounts.find_one({"username":username}))


def get_account_created_template():
    return read_string_template("../email_templates/account_created.txt")


def get_money_sent_template():
    return read_string_template("../email_templates/money_sent.txt")


def get_money_received_template():
    return read_string_template("../email_templates/money_received.txt")


def get_money_deposit_template():
    return read_string_template("../email_templates/money_deposit.txt")


def get_money_withdraw_template():
    return read_string_template("../email_templates/money_withdraw.txt")


def read_string_template(filename):
    with open(filename, 'r') as email_template:
        email_template_content = email_template.read()
    return Template(email_template_content)
