#!/home/vishal/anaconda2/bin/python
from flask import Flask, session, render_template, request, url_for, redirect
import os
import sys
sys.path.append("..")

from src.logger import get_logger
from src.constants import *

sys.path.append(CONFIG_FILE_PATH)
from config import *

app = Flask(__name__)
app.secret_key = os.urandom(24)

log = get_logger(logFileName="webServer.log")

def check_authenticated():
    return {"username": session.get("user")}


@app.route('/', methods=['GET','POST'])
def index():
    return render_template('index.html')

@app.route('/accounts',methods=['GET'])
def get_account_summary():
    error = None
    user = check_authenticated()

    cmd = {}
    cmd["cmd"] = CMD_GET_ACCOUNT_SUMMARY
    cmd["account_number"] = request.form["account_number"]

    server, error = send_command_to_server(cmd)

    try:
        reply = get_data_from_peer(server)
    except Exception, ex:
        error = str(ex)
        log.error("Exception: %s"%error)

    if reply.get("result") != 'passed':
        error = reply.get("errmsg")

    if error:
        return {"error":error}

    return reply


@app.route('/accounts',methods=['POST'])
def create_account():
    error = None
    user = check_authenticated()

    cmd = {}
    cmd["cmd"] = CMD_CREATE_ACCOUNT
    cmd["name"] = request.form["name"]
    cmd["email"] = request.form["email"]

    if request.form["user_type"] == USER_TYPE_CUSTOMER:
        cmd["user_type"] = USER_TYPE_CUSTOMER
        cmd["ssn"] = request.form["ssn"]
        cmd["account_type"] = request.form["account_type"]

    server, error = send_command_to_server(cmd)

    try:
        reply = get_data_from_peer(server)
    except Exception, ex:
        error = str(ex)
        log.error("Exception: %s"%error)

    if reply.get("result") != 'passed':
        error = reply.get("errmsg")

    if error:
        return {"error":error}

    return reply

@app.route('/accounts',methods=['PUT'])
def freeze_or_reactivate_account():
    error = None
    user = check_authenticated()

    cmd = {}
    if request.form["cmd"] == 'freeze':
        cmd["cmd"] = CMD_FREEZE_ACCOUNT
    else:
        cmd["cmd"] = CMD_REACTIVATE_ACCOUNT

    cmd["username"] = request.form["username"]

    server, error = send_command_to_server(cmd)

    try:
        reply = get_data_from_peer(server)
    except Exception, ex:
        error = str(ex)
        log.error("Exception: %s"%error)

    if reply.get("result") != 'passed':
        error = reply.get("errmsg")

    if error:
        return {"error":error}

    return reply

@app.route('/accounts',methods=['DELETE'])
def delete_account():
    error = None
    user = check_authenticated()

    cmd = {}
    cmd["cmd"] = CMD_DELETE_ACCOUNT
    cmd["account_number"] = request.form["account_number"]

    server, error = send_command_to_server(cmd)

    try:
        reply = get_data_from_peer(server)
    except Exception, ex:
        error = str(ex)
        log.error("Exception: %s"%error)

    if reply.get("result") != 'passed':
        error = reply.get("errmsg")

    if error:
        return {"error":error}

    return reply

@app.route('/transfer',methods=['POST'])
def transfer_funds():
    error = None
    user = check_authenticated()

    cmd = {}
    cmd["cmd"] = CMD_TRANSFER_FUNDS
    cmd["username"] = user["username"]
    cmd["account_number"] = user["account_number"]
    cmd["amount"] = user["amount"]

    server, error = send_command_to_server(cmd)

    try:
	reply = get_data_from_peer(server)
    except Exception, ex:
	error = str(ex)
	log.error("Exception: %s"%error)

    if reply.get("result") != 'passed':
	error = reply.get("errmsg")

    if error:
	return {"error":error}

    return reply


@app.route('/deposit',methods=['POST'])
def deposit_funds():
    error = None
    user = check_authenticated()

    cmd = {}
    cmd["cmd"] = CMD_DEPOSIT_FUNDS
    cmd["account_number"] = user["account_number"]
    cmd["amount"] = user["amount"]

    server, error = send_command_to_server(cmd)

    try:
	reply = get_data_from_peer(server)
    except Exception, ex:
	error = str(ex)
	log.error("Exception: %s"%error)

    if reply.get("result") != 'passed':
	error = reply.get("errmsg")

    if error:
	return {"error":error}

    return reply


@app.route('/withdraw',methods=['POST'])
def withdraw_funds():
    error = None
    user = check_authenticated()

    cmd = {}
    cmd["cmd"] = CMD_WITHDRAW_FUNDS
    cmd["account_number"] = user["account_number"]
    cmd["amount"] = user["amount"]

    server, error = send_command_to_server(cmd)

    try:
	reply = get_data_from_peer(server)
    except Exception, ex:
	error = str(ex)
	log.error("Exception: %s"%error)

    if reply.get("result") != 'passed':
	error = reply.get("errmsg")

    if error:
	return {"error":error}

    return reply


@app.route('/users',methods=['PUT'])
def change_password():
    error = None
    con = get_mongo_connection()
    db = get_banking_db(con)
    users = get_users_collection(db)

    user = check_authenticated()

    if request.form["username"] != user["username"]:
        return {"error":"Invalid username"}

    user_acc = users.find_one({"username":user["username"]})
    if not user_acc:
        return {"error":"User account does not exist"}

    if request.form["password"] != user_acc["password"]:
        return {"error":"Invalid credentials"}

    if request.form["new_password1"] != user_acc["new_password2"]:
        return {"error":"Passwords don't match"}

    users.update({"username":user["username"]},{"$set":{"password":request.form["new_password"]}})
    return {"msg":"Password updated successfully"}


@app.route('/session', methods=["DELETE"])
def logout():
    session.pop('user',None)
    return 'Dropped!'

if __name__ == '__main__':
    app.run(host=WEB_SERVER_IP, port=WEB_SERVER_PORT, debug=True)
