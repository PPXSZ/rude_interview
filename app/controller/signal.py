# -*- coding: utf-8 -*-#

# -----------------------
# Name:         信令服务
# Description:  
# Author:       mao
# Date:         2020/6/14
# -----------------------
import re
from application import socketio
from flask_socketio import emit, join_room, leave_room, send


# emit('my response', data, broadcast=True) 发送给所有人
# socketio.emit('some event', {'data': 42}) 触发消息
# send(username + ' has left the room.', room=room) 给指定房间发送

@socketio.on('join')
def signal_join(roomid):
    """
    加入房间
    """
    if not re.match(r'^[0-9]{6,16}$', roomid):
        emit("error", f"房间号:[{roomid}]非法!")
        return
    join_room(roomid)
    emit("joined", f"加入成功!")
