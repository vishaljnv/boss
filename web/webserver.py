#!/home/vishal/anaconda2/bin/python
import os
import sys
import random
import string
import datetime

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

ROOT_PATH = "/opt/boss/web/client"

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
                db_user["_id"] = str(db_user["_id"])
                return db_user
            else :
                error = 'unauthorized'
        else:
            error = 'unauthorized'
    except Exception, ex:
        log.error("check_authorized: Exception: %s"%str(ex))
        bottle.abort(500, json.dumps({ 'error' : str(ex)}))
    if error:
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
            print "DB User:",db_user
    except Exception, ex:
        log.error("Exception in create_sessions: %s"%str(ex))
    if success:
        #pass
        if db_user["username"] == "admin":
            serve_static_file("admin_home.html")

        return {"users":json_friendly(db_user)}
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


@route('/', method='GET')
def index():
    return serve_static_file('index.html')

@route('/accounts')
def get_account_summary():
    error = None

    cmd = {}
    cmd["cmd"] = CMD_GET_ACCOUNT_SUMMARY
    cmd["username"] = bottle.request.query.s

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


@route('/accounts',method='POST')
def create_account():
    error = None
    #user = check_authorized()

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

@route('/accounts',method='PUT')
def freeze_or_reactivate_account():
    error = None
    #user = check_authorized()

    acc_num = str(bottle.request.query.s)
    cmd = {}
    print "Form: ",type(acc_num)
    cmd["cmd"] = CMD_FREEZE_ACCOUNT
    cmd["account_number"] = acc_num

    accounts = get_accounts_collection(db)
    accounts.update({"number":long(acc_num)},{"$set":{"hold":True}})
    '''
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
    '''
    return {}


@route('/accounts-re',method='PUT')
def freeze_or_reactivate_account():
    error = None
    #user = check_authorized()

    acc_num = str(bottle.request.query.s)
    print "Form: ",acc_num
    cmd = {}
    cmd["cmd"] = CMD_REACTIVATE_ACCOUNT
    cmd["account_number"] = acc_num

    accounts = get_accounts_collection(db)
    accounts.update({"number":long(acc_num)},{"$set":{"hold":False}})
    '''
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
    '''
    return {}

@route('/accounts',method='DELETE')
def delete_account():
    error = None
    #user = check_authorized()

    acc_num = bottle.request.query.s
    cmd = {}
    cmd["cmd"] = CMD_DELETE_ACCOUNT
    cmd["account_number"] = acc_num
    cmd["user_type"] = USER_TYPE_CUSTOMER

    server, error = send_command_to_server(cmd)

    try:
        reply = get_data_from_peer(server)
    except Exception, ex:
        error = str(ex)
        log.error("Exception: %s"%error)

    if reply.get("result") != 'passed':
        error = reply.get("error")

    if error:
        bottle.abort(400, json.dumps({ 'error' : error}))
        return {"error":error, "result":"failed"}

    return reply

@route('/transfer',method='POST')
def transfer_funds():
    error = None
    #user = check_authorized()

    form = json.load(bottle.request.body)
    cmd = {}
    cmd["cmd"] = CMD_TRANSFER_FUNDS
    cmd["username"] = form["username"]
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
        bottle.abort(400, json.dumps({ 'error' : error}))

    return reply


@route('/deposit',method='POST')
def deposit_funds():
    error = None
    #user = check_authorized()

    form = json.load(bottle.request.body)
    cmd = {}
    cmd["cmd"] = CMD_DEPOSIT_FUNDS
    cmd["account_number"] = long(form["account_number"])
    cmd["amount"] = form["amount"]

    print form
    server, error = send_command_to_server(cmd)

    try:
	reply = get_data_from_peer(server)
    except Exception, ex:
	error = str(ex)
	log.error("Exception: %s"%error)

    print "Reply:", reply
    if reply.get("result") != 'passed':
	error = reply.get("error")

    if error:
        bottle.abort(400, json.dumps({ 'error' : error}))

    return reply


@route('/withdraw',method='POST')
def withdraw_funds():
    error = None
    #user = check_authorized()

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
        bottle.abort(400, json.dumps({ 'error' : error}))

    return reply


@route('/users',method='PUT')
def change_password():
    error = None
    users = get_users_collection(db)
    #user = check_authorized()

    form = json.load(bottle.request.body)

    user_acc = users.find_one({"username":form["username"]})
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
    #user = check_authorized()

    cmd = {}
    cmd["cmd"] = CMD_GET_TELLER_DETAILS
    cmd["employee_id"] = form["employee_id"]

    try:
        all_tels = list(tellers.find())
        return {"tellers":all_tells}
    except Exception, ex:
        error = str(ex)
        log.error("Exception: %s"%error)

    if reply.get("result") != 'passed':
        error = reply.get("errmsg")

    if error:
        return {"error":error}

    return reply

@route('/tellers',method='POST')
def add_teller():
    error = None
    reply = {"error":"its fine"}
    #user = check_authorized()

    form = json.load(bottle.request.body)
    cmd = {}
    cmd["cmd"] = CMD_CREATE_ACCOUNT
    cmd["user_type"] = USER_TYPE_TELLER

    cmd.update(form)
    print "Tellers: ", form
 
    server, error = send_command_to_server(cmd)

    try:
        reply = get_data_from_peer(server)
    except Exception, ex:
        error = str(ex)
        log.error("Exception: %s"%error)

    if not reply:
       return {"error":"Server down"}

    if reply.get("result") != 'passed':
        error = reply.get("errmsg")

    if error:
        return {"error":error}

    return reply


@route('/tellers',method='DELETE')
def get_teller_details():
    error = None
    reply = {"error":"its fine"}
    #user = check_authorized()

    emp_id = int(bottle.request.query.s)
   
    print emp_id 
    employees = get_employees_collection(db)
    users = get_users_collection(db)
    emp = employees.find_one()

    user = emp["username"]
    employees.remove({"employee_id":emp_id})
    users.remove({"username":user})
 
    if not reply:
       return {"error":"Server down"}

    if reply.get("result") != 'passed':
        error = reply.get("errmsg")

    if error:
        return {"error":error}

    return reply


@route("/all_tellers", method='GET')
def get_all_tellers():
    accounts = get_employees_collection(db)
    all_acc = list(accounts.find())
    return {"accounts":json_friendly(all_acc)}


@route("/all_accounts", method='GET')
def get_all_accounts():
    accounts = get_accounts_collection(db)
    all_acc = list(accounts.find())
    return {"accounts":json_friendly(all_acc)}


@route("/users")
def get_user_details():
    username = bottle.request.query.s
    users = get_users_collection()
    
    user = user.find_one({"username":username})
    return {"users":json_friendly(user)}


if __name__ == '__main__':
    run(host="0.0.0.0", port=WEB_SERVER_PORT, server='twisted')
