import socket
import json
import errno
import pymongo

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


def get_mongo_connection():
    return pymongo.MongoClient()


def get_banking_db(mongo_con):
    return mongo_con[DB_NAME]


def get_accounts_collection(db):
    return db[ACCOUNTS_COLLECTION_NAME]


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
