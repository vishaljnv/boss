#!/home/vishal/anaconda2/bin/python
import os
import sys
sys.path.append("..")

import bottle
from bottle import route, run, static_file, put
from bottle import request, response, redirect, error, abort
import json
from bson.objectid import ObjectId

from src.logger import get_logger
from src.constants import *
from src.utils import *

sys.path.append(CONFIG_FILE_PATH)
from config import *

log = get_logger(logFileName="webServer.log")

con = get_mongo_connection()
db = get_banking_db(con)


def json_friendly(obj):
    if not obj or type(obj) in (int, float, str, unicode, bool, long):
        return obj
    if type(obj) == datetime.datetime:
        return obj.strftime('%Y-%m-%dT%H:%M:%S')
    if type(obj) == dict:
        for k in obj:
            obj[k] = json_friendly(obj[k])
        return obj
    if type(obj) == list:
        for i, v in enumerate(obj):
            obj[i] = json_friendly(v)
        return obj
    if type(obj) == tuple:
        temp = []
        for v in obj:
            temp.append(json_friendly(v))
        return tuple(temp)
    return str(obj)


def random_string(length=10):
    return "".join([random.choice(string.ascii_letters +
                                  string.digits) for i in range(length)])

def check_authorized():
    users = get_users_collection(db)
    session_id = None
    error = None
    session_id = request.get_cookie('session_id', None)
    try:
        if session_id:
            db_user = users.find_one({'session_id':session_id})

            if db_user:
                return db_user
            else :
                error = 'unauthorized'
        else:
            error = 'unauthorized'
    except Exception, ex:
        log.error("check_authorized: Exception: %s"%str(ex))
        bottle.abort(500, json.dumps({ 'error' : str(ex)}))
    if errors:
        log.error("check_authorized: error: %s"%error)
        bottle.abort(401, json.dumps({'error': error}))


@route('/<path:path>')
def serve_static_file(path):
    response.set_header('Content-Type', 'application/json')
    response.set_header('Pragma', 'no-cache')
    response.set_header('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate')
    return static_file(path, root=ROOT_PATH)


@route('/sessions', method='POST')
def create_session():
    errors = None
    username = None
    password = None
    success = False
    db_user = None
    form = None
    session_id = None
    try:
        users = get_users_collection(db)
        form = json.load(bottle.request.body)
        username = form.get('username', '').strip().lower()
        password = form.get('password', '')
        log.debug("username:(%s) password:(%s)"%(username,password))
        if not username:
            errors.append('empty.username')
        if not password:
            errors.append('empty.password')
    except Exception, ex1:
        error = str(ex1)
        #errors.append('error.parse')
    if errors:
        bottle.abort(400, json.dumps({ 'error' : error }))
    try:
        db_user = users.find_one({'username':username,
                                     'password':password})
        if db_user:
            session_id = random_string(16)
            db_user['session_id'] = session_id
            db_user["logged_in"] = True
            users.save(db_user)
            response.set_cookie('session_id', session_id)
            success = True
    except Exception, ex:
        log.error("Exception in create_sessions: %s"%str(ex))
    if success:
        #pass
        redirect('/sessions/mine')
    else:
        bottle.abort(400, json.dumps({ 'error' : 'unauthorized'}))


@route('/sessions/mine')
def session_details():
    error = None
    session_user = None
    session_user = check_authorized()
    try:
        if session_user:
            if 'password' in session_user:
                del session_user['password']
            if 'session_id' in session_user:
                del session_user['session_id']
            return {'users': json_friendly(session_user)}
        else:
            error = "unauthorized"
    except Exception, ex:
        bottle.abort(500, json.dumps({'error': str(ex)}))
    if errors:
        bottle.abort(400, json.dumps({'error': error}))


@route('/sessions/mine', method='DELETE')
def delete_session():
    session_user = None
    session_user = check_authorized()
    error = None
    try:
        if session_user:
            session_user['session_id'] = None
            session_user["logged_in"] = False
            users.save(session_user)
        else:
            errors = 'unauthorized'
    except Exception, ex:
        log.error("Exception while deleting user: %s"%str(ex))
        bottle.abort(500, json.dumps({ 'error' : str(ex)}))
    if errors:
        bottle.abort(400, json.dumps({'error': error}))


@route('/', methods=['GET','POST'])
def index():
    return render_template('index.html')

@route('/accounts',methods=['GET'])
def get_account_summary():
    error = None
    user = check_authorized()

    form = json.load(bottle.request.body)
    cmd = {}
    cmd["cmd"] = CMD_GET_ACCOUNT_SUMMARY
    cmd["account_number"] = form["account_number"]

    server, error = send_command_to_server(cmd)

    try:
        reply = get_data_from_peer(server)
    except Exception, ex:
        error = str(ex)
        log.error("Exception: %s"%error)

    if reply.get("result") != 'passed':
        error = reply.get("error")

    if error:
        return {"error":error, "result":"failed"}

    return reply


@route('/accounts',methods=['POST'])
def create_account():
    error = None
    user = check_authorized()

    form = json.load(bottle.request.body)
    cmd = {}
    cmd["cmd"] = CMD_CREATE_ACCOUNT
    cmd["name"] = form["name"]
    cmd["email"] = form["email"]
    cmd["user_type"] = USER_TYPE_CUSTOMER
    cmd["ssn"] = form["ssn"]
    cmd["account_type"] = form["account_type"]
    cmd["address"] = form["address"]

    server, error = send_command_to_server(cmd)

    try:
        reply = get_data_from_peer(server)
    except Exception, ex:
        error = str(ex)
        log.error("Exception: %s"%error)

    if reply.get("result") != 'passed':
        error = reply.get("error")

    if error:
        return {"error":error, "result":"failed"}

    return reply

@route('/accounts',methods=['PUT'])
def freeze_or_reactivate_account():
    error = None
    user = check_authorized()

    form = json.load(bottle.request.body)
    cmd = {}
    if form["cmd"] == 'freeze':
        cmd["cmd"] = CMD_FREEZE_ACCOUNT
    else:
        cmd["cmd"] = CMD_REACTIVATE_ACCOUNT

    cmd["account_number"] = form["account_number"]

    server, error = send_command_to_server(cmd)

    try:
        reply = get_data_from_peer(server)
    except Exception, ex:
        error = str(ex)
        log.error("Exception: %s"%error)

    if reply.get("result") != 'passed':
        error = reply.get("error")

    if error:
        return {"error":error, "result":"failed"}

    return reply

@route('/accounts',methods=['DELETE'])
def delete_account():
    error = None
    user = check_authorized()

    form = json.load(bottle.request.body)
    cmd = {}
    cmd["cmd"] = CMD_DELETE_ACCOUNT
    cmd["account_number"] = form["account_number"]

    server, error = send_command_to_server(cmd)

    try:
        reply = get_data_from_peer(server)
    except Exception, ex:
        error = str(ex)
        log.error("Exception: %s"%error)

    if reply.get("result") != 'passed':
        error = reply.get("error")

    if error:
        return {"error":error, "result":"failed"}

    return reply

@route('/transfer',methods=['POST'])
def transfer_funds():
    error = None
    user = check_authorized()

    form = json.load(bottle.request.body)
    cmd = {}
    cmd["cmd"] = CMD_TRANSFER_FUNDS
    cmd["username"] = user["username"]
    cmd["account_number"] = form["account_number"]
    cmd["amount"] = form["amount"]

    server, error = send_command_to_server(cmd)

    try:
	reply = get_data_from_peer(server)
    except Exception, ex:
	error = str(ex)
	log.error("Exception: %s"%error)

    if reply.get("result") != 'passed':
	error = reply.get("error")

    if error:
	return {"error":error, "result":"failed"}

    return reply


@route('/deposit',methods=['POST'])
def deposit_funds():
    error = None
    user = check_authorized()

    form = json.load(bottle.request.body)
    cmd = {}
    cmd["cmd"] = CMD_DEPOSIT_FUNDS
    cmd["account_number"] = form["account_number"]
    cmd["amount"] = form["amount"]

    server, error = send_command_to_server(cmd)

    try:
	reply = get_data_from_peer(server)
    except Exception, ex:
	error = str(ex)
	log.error("Exception: %s"%error)

    if reply.get("result") != 'passed':
	error = reply.get("error")

    if error:
	return {"error":error, "result":"failed"}

    return reply


@route('/withdraw',methods=['POST'])
def withdraw_funds():
    error = None
    user = check_authorized()

    form = json.load(bottle.request.body)
    cmd = {}
    cmd["cmd"] = CMD_WITHDRAW_FUNDS
    cmd["account_number"] = form["account_number"]
    cmd["amount"] = form["amount"]

    server, error = send_command_to_server(cmd)

    try:
	reply = get_data_from_peer(server)
    except Exception, ex:
	error = str(ex)
	log.error("Exception: %s"%error)

    if reply.get("result") != 'passed':
	error = reply.get("error")

    if error:
	return {"error":error, "result":"failed"}

    return reply


@route('/users',methods=['PUT'])
def change_password():
    error = None
    users = get_users_collection(db)
    user = check_authorized()

    form = json.load(bottle.request.body)

    user_acc = users.find_one({"username":user["username"]})
    if not user_acc:
        return {"error":"User account does not exist", "result":"failed"}

    if form["password"] != user_acc["password"]:
        return {"error":["Invalid Credentials"], "result":"failed"}

    if form["new_password1"] != form["new_password2"]:
        return {"error":["Passwords don't match"], "result":"failed"}

    users.update({"username":user["username"]},{"$set":{"password":request.form["new_password1"]}})
    return {"result":"passed","error":"Password updated successfully"}


@route('/tellers',method='GET')
def get_teller_details():
    error = None
    user = check_authorized()

    form = json.load(bottle.request.body)
    cmd = {}
    cmd["cmd"] = CMD_GET_TELLER_DETAILS
    cmd["employee_id"] = form["employee_id"]

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


if __name__ == '__main__':
    run(host="0.0.0.0", port=WEB_SERVER_PORT, server='twisted')
