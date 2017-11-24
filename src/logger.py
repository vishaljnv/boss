#!/home/vishal/anaconda2/bin/python

import logging
import logging.handlers

def setup_logger(logger_name, log_file, level=logging.DEBUG):
    logger = logging.getLogger(logger_name)
    formatter = logging.Formatter("[%(levelname)s : %(filename)s - %(lineno)s : %(asctime)s ]: %(message)s")
    fileHandler = logging.handlers.RotatingFileHandler(log_file, maxBytes=1*1024*1024*1024, backupCount=5)
    fileHandler.setFormatter(formatter)
    streamHandler = logging.StreamHandler()
    streamHandler.setFormatter(formatter)
    logger.setLevel(level)
    logger.addHandler(fileHandler)
    logger.addHandler(streamHandler)
    return logger

__logger = None

def get_logger(logFileName=None):
    global __logger
    logFile = logFileName
    if not __logger:
        if not logFile:
            logFile = "bosslog.log"
        __logger = setup_logger('debug', "/opt/logs/boss/" + logFile)
    return __logger
