;
// 面试界面逻辑控制

// 界面元素
let local = document.querySelector("video#local");
let remote = document.querySelector("video#remote");

// 本机采集的视频信息
let localStream;
// 信令服务器连接
let socket;


/**
 * 连接信令服务器
 */
function connectSignal() {
    socket = io.connect();
    socket.on('connect', (e)=>{
        socket.emit('join', '222222');
    });
    socket.on('joined', (e)=>{
        // 加入房间
        layer.msg(e);
    });
    socket.on('error', (e)=>{
        // 出现错误
        layer.msg(e);
    });
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
 * 处理错误
 */
function handleError(e) {
    console.error('error:', e);
}

start();
;