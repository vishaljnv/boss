#!/home/vishal/anaconda2/bin/python2.7

import bottle
import json
import pymongo

from bottle import run, route
from utils import *
from constants import *

mongoCon = get_mongo_connection()
db = get_banking_db(mongoCon)

def check_logged_in(data):
    users = get_users_collection(db)
    user = users.find_one({"user_name":data.get("user_name"), "password":data.get("password"),\
                                "session_id":data.get("session_id")})
    return bool(user)


@route("/sessions",method="POST")
@route("/sessions/",method="POST")
def login():
    form = json.load(bottle.request.body)

    print form
    con = get_connection_to_server()
    if not con:
        bottle.abort(500, json.dumps({ 'errors' : ["could not connect to server"]}))

    data = form
    data["cmd"] = "login"
    send_data_to_peer(con, data)
    response = get_data_from_peer(con)

    if not response:
        bottle.abort(500, json.dumps({ 'errors' : ["login failed!"]}))
    if response.get("errcode") != ERRCODE_REQUEST_SUCCESS:
        bottle.abort(500, json.dumps({ 'errors' : [response.get("errmsg","login failed!")]}))

    return {"session_id":response["data"]["session_id"]}


@route("/sessions",method="DELETE")
@route("/sessions/",method="DELETE")
def logout():
    form = json.load(bottle.request.body)

    print form
    if not check_logged_in(form):
        bottle.abort(500, json.dumps({ 'errors' : ["no session exists"]}))

    con = get_connection_to_server()
    if not con:
        bottle.abort(500, json.dumps({ 'errors' : ["could not connect to server"]}))

    data = form
    data["cmd"] = "logout"

    send_data_to_peer(con, data)
    response = get_data_from_peer(con)
    if not response:
        bottle.abort(500, json.dumps({ 'errors' : ["logout failed!"]}))
        return

    if response.get("errcode") != ERRCODE_REQUEST_SUCCESS:
        bottle.abort(500, json.dumps({ 'errors' : [response.get("errmsg","logout failed!")]}))
        return

    return response


@route("/account-types",method="GET")
@route("/account-types/",method="GET")
def get_account_types():
    account_types_cllctn = get_account_types_collection(db)
    account_types = account_types_cllctn.distinct("name")
    return {"data":{"account_types":account_types}}

    
run(host="0.0.0.0",port=1234,server='twisted')
