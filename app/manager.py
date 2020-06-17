# -*- coding: utf-8 -*-#

# -----------------------
# Name:         入口文件
# Description:  
# Author:       mao
# Date:         2020/6/13
# -----------------------

from application import app
from route import *


if __name__ == "__main__":
    app.run("0.0.0.0", 83, True, True, ssl_context=(
        "./keys/server.crt", "./keys/server.key"))
