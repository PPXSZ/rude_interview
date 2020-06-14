;
// 房间id
let $roomid = $("#roomid");
// 进入按钮
let $btnEnter = $("#enter");
// 随机生成房间号按钮
let $btnRandom = $("#random");

// 随机生成
$btnRandom.click((e)=>{
    $roomid.val(Math.random().toString(10).slice(12));
});

// 进入房间点击
$btnEnter.click((e)=>{
    let v = $roomid.val();
    let reg=/^[0-9]{6,16}$/;
    if (!reg.test(v)){
        layer.msg('房间号必须是6-16位的数字');
        return;
    }
    // 进入房间
    let url = TOOLS.getUrl("/interview",
        {
            roomid: v,
            }
        );
    location.href = url;
});
;