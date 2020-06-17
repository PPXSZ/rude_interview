;
// 面试界面逻辑控制

// 界面元素
let local = document.querySelector("video#local");
let remote = document.querySelector("video#remote");
let $stop = $("#stop");
let $reload = $("#reload");
let $chat = $("#chat");
let $send = $("#send");
let $msg = $("#msg");

// 本机采集的视频信息
let localStream;
// 信令服务器连接
let socket;
// 当前房间id
let roomid = $("#roomid").val();
// 当前状态
let stat = 'init';
// peer connection
let pc;
// data channel
let dc;

/**
 * 打印错误信息
 */
function handleError(e) {
    console.error('error:', e);
}

/**
 * dataChannel 收到数据
 */
function onDataChannelMsg(msg) {
    // 收到消息
    // console.log(msg);
    if (msg.data)
        $chat.text($chat.text() + "对方 :" + msg.data + '\r\n');
}

/**
 * dataChannel 状态改变
 */
function onDataChannelStateChanged() {

}

/**
 * 进行媒体协商
 */
function mediaNegotiate() {
    // 状态检查
    if (!pc || stat !== "ready"){
        layer.msg('当前状态无法进行媒体协商!');
        return;
    }

    let config = {
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1
    }
    pc.createOffer(config)
        .then((offer)=>{
            // 成功创建offer
            // 1.设置本地description
            // 会触发ice收集candidate事件
            console.log('set local sdp...');
            pc.setLocalDescription(offer);

            // 2.通过信令服务器发送给对端
            sendMessage('message', offer);
        }).catch(handleError);
}

/**
 * 创建点对点连接
 */
function createPeerConnection() {
    console.log('do create peer connection');
    if (!pc){
        // 创建pc
        let config = {
            'iceServers': [{
            'urls': 'turn:139.199.19.250:3478',
            'credential': '111111',
            'username': 'mao'
           }]
        };
        pc = new RTCPeerConnection(config);
        // 添加监听事件
        pc.onicecandidate = (e)=>{
            if (!e.candidate) return;
            // 获取到候选者
            console.log('detected new candidate:', e.candidate);
            // 将候选者信息发送给对端
            sendMessage('message', {
                type: 'candidate',
                candidate: e.candidate.candidate,
                id: e.candidate.sdpMid,
                index: e.candidate.sdpMLineIndex
            });
        };

        pc.ontrack = (e)=>{
            // 接收到远端的媒体数据
            remote.srcObject = e.streams[0];
        }

        // 获取data channel
        pc.ondatachannel = e =>{
            if (dc) return;
            dc = e.channel;
            dc.onmessage = onDataChannelMsg;
            dc.onopen = dc.onclose = onDataChannelStateChanged;
        }

    }
    if (localStream){
        pc.addStream(localStream);
    }
}

/**
 * 连接信令服务器
 */
function connectSignal() {
    socket = io.connect();
    socket.on('connect', (e)=>{
        stat = "connect";
        console.log('connect to signal stat: ', stat);
        socket.emit('join', roomid);
    });
    socket.on('message', (e)=>{
        console.log('message received: ', e);
        if (!e) return;
        if (e['type'] === 'offer'){
            // 收到远端传来的offer
            console.log('set remote sdp...');
            pc.setRemoteDescription(new RTCSessionDescription(e));
            // 创建answer
            pc.createAnswer()
                .then((answer)=>{
                    // 设置本地description
                    console.log('set local sdp...');
                    pc.setLocalDescription(answer);
                    // 发给远端响应
                    sendMessage('message', answer);
                }).catch(handleError);
        } else if(e['type'] === 'answer'){
            // 接受到对端返回的协商answer
            console.log('set remote sdp..');
            pc.setRemoteDescription(new RTCSessionDescription(e));
        } else if(e['type'] === 'candidate'){
            // 设置candidate
            let candidate = new RTCIceCandidate({
                sdpMLineIndex: e.index,
                candidate: e.candidate
            });
            // 添加candidate,进行连接性检测
            pc.addIceCandidate(candidate);
        }
    });
    socket.on('joined', (e)=>{
        // 加入房间
        stat = "joined";
        console.log('joined room stat: ', stat);

        // 创建pc
        createPeerConnection();
    });
    socket.on('leaved', (e)=>{
        // 离开房间
        console.log('leaved room stat:', stat);
        if (socket){
            socket.close();
            socket = null;
            stat = "init";
        }
    });
    socket.on('other_joined', (e)=>{
        stat = "ready";
        console.log("other joined stat:", stat);
        if (!pc)
            createPeerConnection();
        // 创建聊天通道
        dc = pc.createDataChannel('chat');
        dc.onmessage = onDataChannelMsg;
        dc.onopen = dc.onclose = onDataChannelMsg;
        // 尝试进行媒体协商
        mediaNegotiate();
    });
    socket.on('other_leave', (e)=>{
        stat = "unbind";
        pc.close();
        pc = null;
        console.log("other leave room stat: ", stat);
    });
    socket.on('error', (e)=>{
        // 出现错误
        layer.msg(e);
    });
    socket.on('full', (e)=>{
        // 房间满人
        layer.msg('当前房间已满! : ' + e);
    });
}

/**
 * 发送socket消息
 * @param event 事件
 * @param data 数据
 */
function sendMessage(event, data) {
    console.log('send socket message...', data);
    if (socket){
        socket.emit(event, roomid, data);
    }
}

/**
 * 当采集到了本地音视频流数据
 */
function onLocalMediaStream(stream) {
    // 给localStream
    localStream = stream;
    local.srcObject = localStream;
    // 连接信令服务器
    connectSignal();
}

/**
 * 开始采集视频
 */
function start() {
    if (!navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia){
        layer.msg("您的设备不支持采集音视频数据!");
        return;
    }
    // 配置信息
    let constrain = {
        video: true,
        audio: true
    }
    // 尝试采集音视频数据
    navigator.mediaDevices.getUserMedia(constrain)
        .then(onLocalMediaStream)
        .catch(handleError);
}

/**
 * 聊天结束
 */
function stop() {
    socket.emit('leave', roomid);
    pc.close();
    pc = null;
    stat = "init";
}

/**
 * 处理错误
 */
function handleError(e) {
    console.error('error:', e);
}

// 发送消息
$send.click(e=>{
    let msg = $msg.val();
    if (!msg){
        layer.msg("发送信息不能为空!");
        return;
    }
    if (dc){
        // 发送给对端
        dc.send(msg);
        // 自己也显示
        $chat.text($chat.text() + '我 :' + msg + '\r\n');
        // 请求输入框
        $msg.val("");
    }
});

start();
;