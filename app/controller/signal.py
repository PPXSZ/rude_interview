# -*- coding: utf-8 -*-#

# -----------------------
# Name:         信令服务
# Description:  客户端和服务端进行交互
# Author:       mao
# Date:         2020/6/14
# -----------------------
import re
from application import socketio
from flask import request, current_app
from flask_socketio import emit
from room.Rooms import Rooms


# emit('my response', data, broadcast=True) 发送给所有人
# socketio.emit('some event', {'data': 42}) 触发消息
# send(username + ' has left the room.', room=room) 给指定房间发送


@socketio.on('message')
def signal_message(roomid, data):
    """
    只负责转发消息
    """
    roomid = 'r' + roomid
    signal_send_to_room('message', roomid, data, request.sid)


@socketio.on('join')
def signal_join(roomid):
    """
    加入房间
    """
    if not re.match(r'^[0-9]{6,16}$', roomid):
        emit("error", f"房间号:[{roomid}]非法!")
        return
    roomid = "r" + roomid
    rooms = signal_get_rooms()
    sid = request.sid
    if rooms.is_full(roomid):
        # 满员发送full消息
        emit("full", sid)
        return
    # 尝试通知房间的另外一个人
    signal_send_to_room("other_joined", roomid, sid, sid)
    rooms.join_room(roomid, sid)
    emit("joined", request.sid)


@socketio.on("leave")
def signal_leave(roomid):
    """
    离开房间
    """
    roomid = "r" + roomid
    rooms = signal_get_rooms()
    rooms.leave_room(roomid, request.sid)
    emit("leaved")
    # 给其它用户发送other_leave事件
    signal_send_to_room("other_leave", roomid, request.sid)


@socketio.on('disconnect')
def test_disconnect():
    """
    强制关闭连接处理
    """
    sid = request.sid
    rooms = signal_get_rooms()
    if sid in rooms.mapping:
        # 退出房间
        roomid = rooms.mapping[sid].roomid
        rooms.leave_room(roomid, sid)
        # 给房间其他用户发送other_leave事件
        signal_send_to_room("other_leave", roomid, roomid)


def signal_send_to_room(event, roomid, data, excep_sid=None):
    """
    给指定的房间发送消息,除了excep_id用户
    :param event: 事件名称
    :param roomid: 房间id
    :param data: 数据
    :param excep_sid: 例外的用户
    """
    rooms = current_app.rooms
    room = rooms[roomid]
    for sid in room:
        if sid != excep_sid:
            # 发送给sid
            emit(event, data, room=sid)


def signal_get_rooms():
    """
    获取所有房间信息
    :return: 房间s
    """
    if not hasattr(current_app, "rooms"):
        current_app.rooms = Rooms()
    return current_app.rooms
