# -*- coding: utf-8 -*-#

# -----------------------
# Name:         进行路由注册
# Description:  
# Author:       mao
# Date:         2020/6/13
# -----------------------
from application import app
from controller.index import index_page
from controller.interview import interview_page
from common.UrlHelper import UrlHelper
import controller.signal

# 主页路由
app.register_blueprint(index_page, url_prefix="/")
# 面试路由
app.register_blueprint(interview_page, url_prefix="/interview")
# 全局函数
app.add_template_global(UrlHelper.get_static_url, "getStaticUrl")

