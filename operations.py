import random
import string

mongo_con = get_mongo_connection()
db = get_banking_db(mongo_con)

def account_number_exists(acc_num):
    accounts = get_account_types_collection(db)
    return bool(accounts.find_one({"number":acc_num}))


def username_exists(username):
    accounts = get_account_types_collection(db)
    return bool(accounts.find_one({"username":username}))


def get_account_details_by_username(username):
    accounts = get_account_types_collection(db)
    return accounts.find_one({"username":username})


def insert_account_into_database(account):
    accounts = get_account_types_collection(db)
    accounts.insert(account)


def create_account(account_type, name, email):
    account = {}

    acc_num = generate_account_number()
    username = generate_username()
    password = generate_password()

    account["holder_name"] = name
    account["type"] = account_type
    account["username"] = username
    account["password"] = password
    account["number"] = acc_num

    insert_account_into_database(account)


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
            username += random.choice(string.lowrcase + string.uppercase + string.digits)

        if not username_exists(username):
            return username


def generate_password():
    '''Generate random password having alphabets, numbers and special characters.'''

    chars = string.ascii_letters + string.digits + string.punctuation
    return ''.join(random.choice(chars) for _ in range(PASSWORD_MIN_LENGTH))


def get_account_summary_by_username(username):
    summary = {}
    account = get_account_details_by_username(username)
    if not account:
        raise Exception("Account details not available!")

    summary["account_number"] = account["number"]
    summary["account_type"] = account["type"]
    summary["account_balance"] = account["balance"]
    summary["account_holder_name"] = account["holder_name"]
    return summary
