;
let TOOLS = {
    /**
     * 获取url
     * @param path 请求路径
     * @param params 请求参数
     */
    getUrl: (path, params)=>{
        // eg:params:{name:'mao', age:11}
        if (params){
            let _parm_str = Object.keys(params).map(k=>k+"="+params[k]).join("&");
            path += "?" + _parm_str;
        }
        console.log(path)
        return path
    }
}
;