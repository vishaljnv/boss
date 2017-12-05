import random
import string
import datetime

from utils import *

mongo_con = get_mongo_connection()
db = get_banking_db(mongo_con)

def account_number_exists(acc_num):
    accounts = get_accounts_collection(db)
    return bool(accounts.find_one({"number":acc_num}))


def username_exists(username):
    users = get_users_collection(db)
    return bool(users.find_one({"username":username}))


def exceeds_daily_transfer_limit(account_type, amount):
    if account_type == ACCOUNT_TYPE_SAVINGS:
        if amount > SAVINGS_DAILY_TRANSFER_LIMIT:
            return True
    if account_type == ACCOUNT_TYPE_CHECKING:
        if amount > CHECKING_DAILY_TRANSFER_LIMIT:
            return True

    return False


def get_account_balance(acc_number):
    accounts = get_accounts_collection(db)
    account = accounts.find_one({"number":acc_number})
    return account["balance"]


def get_account_details_by_username(username):
    accounts = get_accounts_collection(db)
    return accounts.find_one({"username":username})


def delete_bank_acccount(acc_num):
    accounts = get_accounts_collection(db)
    accounts.remove({"number":acc_num})


def delete_user_acccount(username):
    users = get_users_collection(db)
    users.remove({"username":username})


def delete_employee_account(employee_id):
    employees = get_employees_collection(db)
    employees.remove({"employee_id":employee_id})


def put_bank_account_on_hold(acc_num):
    accounts = get_accounts_collection(db)
    accounts.update({"number":acc_num},{"$set":{"hold":True}})


def reactivate_bank_account(acc_num):
    accounts = get_accounts_collection(db)
    accounts.update({"number":acc_num, "hold":True},{"$set":{"hold":False}})


def is_account_on_hold(acc_num):
    accounts = get_accounts_collection(db)
    account =  accounts.find_one({"number":acc_num})
    return account.get("hold",False)


def get_account_details_by_account_number(account_number):
    accounts = get_accounts_collection(db)
    return accounts.find_one({"number":account_number})


def insert_bank_account_into_database(account):
    accounts = get_accounts_collection(db)
    accounts.insert(account)


def insert_user_account_into_database(user):
    users = get_users_collection(db)
    users.insert(user)


def insert_employee_account_into_database(employee):
    employees = get_employees_collection(db)
    employees.insert(employee)


def add_transaction_to_db(transaction):
    transactions = get_transactions_collection(db)
    transactions.insert(transaction)


def update_account_balance(acc_num, new_bal):
    accounts = get_accounts_collection(db)
    accounts.update({"number":acc_num},{"$set":{"balance":new_bal}})


def create_customer_account(account_type, details):
    account = {}
    user = {}

    acc_num = generate_account_number()
    username = generate_username()
    password = generate_password()

    account["name"] = details["name"]
    account["email"] = details["email"]
    account["ssn"] = details["ssn"]
    account["address"] = details["address"]
    account["type"] = account_type
    account["username"] = username
    account["password"] = password
    account["number"] = acc_num
    account["balance"] = 0
    
    user["username"] = username
    user["password"] = password
    user["type"] = USER_TYPE_CUSTOMER

    insert_user_account_into_database(user)
    insert_bank_account_into_database(account)
    return account, user


def create_teller_account(name, email):
    user = {}
    employee = {}

    username = generate_username()
    password = generate_password()
    employee_id = generate_employee_id()

    employee["name"] = name
    employee["email"] = email
    employee["username"] = username
    employee["employee_id"] = int(employee_id)

    user["username"] = username
    user["password"] = password
    user["type"] = USER_TYPE_TELLER

    insert_user_account_into_database(user)
    insert_employee_account_into_database(employee)
    return user


def generate_account_number():
    '''Generate random 10 digit account number, always starting with 578.
       The first account number created will be 5780000001.'''

    acc_num = 5780000001
    while account_number_exists(acc_num):
        acc_num = random.randint(5780000001, 5789999999)

    return acc_num


def generate_username():
    '''Generate random alphanumeric username.'''

    username = ''
    while True:
        for i in range(USERNAME_MIN_LENGTH):
            username += random.choice(string.digits)

        if not username_exists(username):
            return username


def generate_password():
    '''Generate random password having alphabets, numbers and special characters.'''

    chars = string.ascii_letters + string.digits + "@!$"
    return ''.join(random.choice(chars) for _ in range(PASSWORD_MIN_LENGTH))


def generate_employee_id():
    now = datetime.datetime.today()
    employees = get_employees_collection(db)
    last = employees.find_one(sort=[("employee_id", pymongo.DESCENDING)])
    if not last:
        new_id = 1
    else:
        new_id = last["employee_id"] + 1

    return new_id


def get_account_summary_by_username(username):
    summary = {}
    account = get_account_details_by_username(username)
    if not account:
        raise Exception("Account details not available!")

    summary["account_number"] = account["number"]
    summary["type"] = account["type"]
    summary["balance"] = account["balance"]
    summary["name"] = account["name"]
    summary["hold"] = account.get("hold",False)
    return summary


def get_account_summary_by_account_number(account_number):
    summary = {}
    account = get_account_details_by_account_number(account_number)
    if not account:
        raise Exception("Account details not available!")

    summary["account_number"] = account["number"]
    summary["type"] = account["type"]
    summary["balance"] = account["balance"]
    summary["name"] = account["name"]
    return summary


def get_account_type(acc_num):
    accounts = get_accounts_collection(db)
    account = accounts.find_one({"number":acc_num})
    if not account:
        raise Exception("Account does not exist")

    return account["type"]


def get_username_of_the_account(acc_num):
    accounts = get_accounts_collection(db)
    account = accounts.find_one({"number":acc_num})
    if not account:
        raise Exception("Account does not exist")

    return account["username"]


def get_employee_details(employee_id):
    employees = get_employees_collection(db)
    return employees.find_one({"employee_id":employee_id})


def get_employee_details_by_username(username):
    employees = get_employees_collection(db)
    return employees.find_one({"username":username})


def get_username_of_employee(employee_id):
    employee = get_employee_details(employee_id)
    if not employee:
        raise Exception("Employee details not found")

    return employee.get("username")
