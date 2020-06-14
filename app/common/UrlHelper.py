# -*- coding: utf-8 -*-#

# -----------------------
# Name:         地址工具
# Description:  
# Author:       mao
# Date:         2020/6/13
# -----------------------
import time


class UrlHelper:
    @staticmethod
    def get_static_url(path):
        """
        创建静态资源请求地址，添加版本信息
        """
        return f"/static/{path}?v={time.time()}"
