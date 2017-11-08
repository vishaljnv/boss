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


if __name__ == '__main__':
    main()
