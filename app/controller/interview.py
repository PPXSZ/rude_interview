# -*- coding: utf-8 -*-#

# -----------------------
# Name:         面试控制器
# Description:  面试界面渲染逻辑控制
# Author:       mao
# Date:         2020/6/14
# -----------------------
import re
from flask import Blueprint, request, redirect, render_template

interview_page = Blueprint("interview_page", __name__)


@interview_page.route("/")
def interview():
    req = request.values
    roomid = req.get("roomid", None)
    if not roomid or not re.match(r"^[0-9]{6,16}$", roomid):
        # 房间号有问题
        return redirect("/")
    # 跳转
    return render_template("/interview.html", roomid=roomid)
