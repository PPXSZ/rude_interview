# -*- coding: utf-8 -*-#

# -----------------------
# Name:         存放应用变量
# Description:  
# Author:       mao
# Date:         2020/6/13
# -----------------------
from flask import Flask
from flask_socketio import SocketIO

app = Flask(__name__)
# 信令服务
socketio = SocketIO(app)
