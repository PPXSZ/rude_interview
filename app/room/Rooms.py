# -*- coding: utf-8 -*-#

# -----------------------
# Name:         Rooms
# Description:  信令服务器room机制
# Author:       mao
# Date:         2020/6/15
# -----------------------


class Room:
    def __init__(self, roomid):
        self.roomid = roomid
        self.members = set()

    def __iter__(self):
        """
        遍历房间所有成员
        """
        return self.members.__iter__()

    def add(self, sid):
        """
        添加一个成员
        :param sid: 会话id
        """
        self.members.add(sid)

    def remove(self, sid):
        """
        移除一个成员
        :param sid: 会话id
        """
        if sid in self.members:
            self.members.remove(sid)

    def is_full(self):
        """
        是否已经满了
        """
        return len(self.members) > 1


class Rooms:
    def __init__(self):
        # 所有房间
        self.rooms = {}
        # 记录用户在哪个房间
        self.mapping = {}

    def is_full(self, roomid):
        """
        指定房间是否满人了
        :param roomid: 房间id
        :return:
        """
        if roomid not in self.rooms:
            self[roomid] = Room(roomid)
        return self[roomid].is_full()

    def join_room(self, roomid, sid):
        """
        添加一个用户进入房间
        :param roomid: 房间id
        :param sid: 用户会话id
        """
        if roomid not in self.rooms:
            self.rooms[roomid] = Room(roomid)
        room = self.rooms[roomid]
        room.add(sid)
        # 记录用户所属房间
        self.mapping[sid] = room

    def leave_room(self, roomid, sid):
        """
        移除指定房间的一个成员
        :param roomid: 房间id
        :param sid: 会话id
        """
        if roomid in self.rooms:
            self.rooms[roomid].remove(sid)
            del self.mapping[sid]

    def __setitem__(self, key, value):
        """
        设置房间信息
        :param key: 房间id
        :param value: 房间对象
        """
        self.rooms[key] = value

    def __getitem__(self, roomid):
        """
        获取房间
        :param roomid: 房间号
        :return: 指定房间对象
        """
        return self.rooms.get(roomid, None)

