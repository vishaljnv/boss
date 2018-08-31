import sys
sys.path.append("..")

from src.utils import *
from src.constants import *

user_type = USER_TYPE_CUSTOMER

cmd = {}
cmd["cmd"] = CMD_CREATE_ACCOUNT
cmd["name"] = "Vishal Yarabandi"
cmd["email"] = "vishal.heaven777@gmail.com"
cmd["ssn"] = "0000000"
cmd["user_type"] = USER_TYPE_CUSTOMER
cmd["account_type"] = "Savings"

server, error = send_command_to_server(cmd)
print "Error:",error
reply = get_data_from_peer(server)
print "Reply:",reply

'''
cmd = {}
cmd["cmd"] = CMD_DEPOSIT_FUNDS
cmd["account_number"] = 5780000001
cmd["amount"] = 30000

server, error = send_command_to_server(cmd)
print "Error:",error
reply = get_data_from_peer(server)
print "Reply:",reply
'''
'''
cmd = {}
cmd["cmd"] = CMD_WITHDRAW_FUNDS
cmd["account_number"] = 5780000001
cmd["amount"] = 10000

server, error = send_command_to_server(cmd)
print "Error:",error
reply = get_data_from_peer(server)
print "Reply:",reply
'''
'''
cmd = {}
cmd["cmd"] = CMD_TRANSFER_FUNDS
cmd["username"] = "fJMqhJYu"
cmd["account_number"] = 5782052104
cmd["amount"] = 10000

server, error = send_command_to_server(cmd)
print "Error:",error
reply = get_data_from_peer(server)
print "Reply:",reply
'''
'''
cmd = {}
cmd["cmd"] = CMD_FREEZE_ACCOUNT
cmd["account_number"] = 5780000001

server, error = send_command_to_server(cmd)
print "Error:",error
reply = get_data_from_peer(server)
print "Reply:",reply
'''
'''
cmd = {}
cmd["cmd"] = CMD_REACTIVATE_ACCOUNT
cmd["account_number"] = 5782052104

server, error = send_command_to_server(cmd)
print "Error:",error
reply = get_data_from_peer(server)
print "Reply:",reply
'''
'''
cmd = {}
cmd["cmd"] = CMD_DELETE_ACCOUNT
cmd["user_type"] = USER_TYPE_TELLER
cmd["employee_id"] = 2017001

server, error = send_command_to_server(cmd)
print "Error:",error
reply = get_data_from_peer(server)
print "Reply:",reply
'''
