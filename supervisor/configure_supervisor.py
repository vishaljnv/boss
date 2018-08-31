#!/home/vishal/anaconda2/bin/python

import os
import sys

print "Configuring supervisor..."
try:
    service_file = "supervisor_ubuntu_startup.sh"

    if os.path.exists("/opt/boss/supervisor/supervisord.conf"):
        if os.path.exists("/etc/supervisor/supervisord.conf"):
            print "/etc/supervisor/supervisord.conf already present; Hence Renaming it to /etc/supervisor/supervisord_backup.conf"
            os.system("sudo mv /etc/supervisor/supervisord.conf /etc/supervisor/supervisord_backup.conf")
        os.system("sudo cp supervisord.conf /etc/supervisor/")
        if os.path.exists("/etc/init.d/supervisor"):
            print "/etc/init.d/supervisor already exists; Hence renaming it to /etc/init.d/supervisor_backup"
            os.system("sudo mv /etc/init.d/supervisor /etc/init.d/supervisor_backup")
        os.system("sudo cp %s /etc/init.d/supervisor" % service_file)
    else:
        print "Configuration file supervisord.conf doesn't exists"
except Exception, e:
    print "Unable to configure supervisor: ", e
    
