# -*- coding: utf-8 -*-#

# -----------------------
# Name:         首页控制器
# Description:  渲染首页相关的逻辑
# Author:       mao
# Date:         2020/6/13
# -----------------------
from flask import Blueprint, render_template

index_page = Blueprint("index_page", __name__)


@index_page.route("/")
def index():
    """
    渲染首页
    """
    return render_template("/index.html")


