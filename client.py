#!/home/vishal/anaconda2/bin/python2.7

import socket
import json

data = {"cmd":"login","user_name":"vishal","password":"vishal"}

s = socket.socket()
s.connect(("0.0.0.0",1234))
s.send(json.dumps(data))
reply = s.recv(4096)

print "Reply:",reply
