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


def handleClient(con):
    request = get_data_from_peer(con)
    if not request:
        print "get request failed!"

    if request.get('cmd') == 'login':
        response = login(request)
    elif request.get('cmd') == 'logout':
        response = logout(request)

    if response:
        send_data_to_peer(con, response)


def constructResponseMessage(errcode, data=None):
    if errcode == ERRCODE_WRONG_CREDENTIALS:
        errmsg = ERRMSG_WRONG_CREDENTIALS
    elif errcode == ERRCODE_CAN_NOT_LOGOUT:
        errmsg = ERRMSG_CAN_NOT_LOGOUT
    elif errcode == ERRCODE_REQUEST_SUCCESS:
        errmsg = ERRMSG_REQUEST_SUCCESS
    else:
        errmsg = ERRMSG_UNKNOWN

    return {"errcode":errcode, "errmsg":errmsg, "data":data}


def logout(request):
    db = get_banking_db(mongoConection)
    users = get_users_collection(db)

    user_name = request.get("user_name")
    session_id = request.get("session_id")

    user = users.find_one({"user_name":user_name, "session_id":session_id})
    if not user:
        return constructResponseMessage(ERRCODE_CAN_NOT_LOGOUT)

    users.update({"user_name":user_name}, {"$unset":{"session_id":0}})

    return constructResponseMessage(ERRCODE_REQUEST_SUCCESS)


def login(request):
    db = get_banking_db(mongoConection)
    users = get_users_collection(db)

    user_name = request.get("user_name")
    password = request.get("password")

    user = users.find_one({"user_name":user_name, "password":password})
    if not user:
        return constructResponseMessage(ERRCODE_WRONG_CREDENTIALS)

    session_id = str(uuid.uuid4())
    users.update({"user_name":user_name, "password":password},{"$set":{"session_id":session_id}})

    return constructResponseMessage(ERRCODE_REQUEST_SUCCESS, {"session_id":session_id})


if __name__ == '__main__':
    main()
