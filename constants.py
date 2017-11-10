DB_NAME                           = "bank"
ACCOUNTS_COLLECTION_NAME          = "accounts"
ACCOUNT_TYPES_COLLECTION_NAME     = "account_types"
USERS_COLLECTION_NAME             = 'users'
TRANSACTIONS_COLLECTION_NAME      = 'transactions'

PASSWORD_MIN_LENGTH       = 8
USERNAME_MIN_LENGTH       = 8

ERRCODE_REQUEST_SUCCESS   = 300
ERRMSG_REQUEST_SUCCESS    = "Success"
ERRCODE_WRONG_CREDENTIALS = 301
ERRMSG_WRONG_CREDENTIALS  = "Invalid credentials"
ERRCODE_CAN_NOT_LOGOUT    = 302
ERRMSG_CAN_NOT_LOGOUT     = "Can not logout"
ERRMSG_UNKNOWN            = "Unknown error"

SAVINGS_DAILY_TRANSFER_LIMIT      = 2500
CHECKING_DAILY_TRANSFER_LIMIT     = 5000

ACCOUNT_TYPE_SAVINGS              = 'Savings'
ACCOUNT_TYPE_CHECKING             = 'Checking'
ACCOUNT_TYPE_DEPOSIT              = 'Deposit'

USER_TYPE_CUSTOMER                = 'customer'
USER_TYPE_TELLER                  = 'teller'
USER_TYPE_ADMIN                   = 'admin'

TRANSACTION_TYPE_TRANSFER         = 'transfer'
TRANSACTION_TYPE_DEPOSIT          = 'deposit'
TRANSACTION_TYPE_WITHDRAW         = 'withdraw'
