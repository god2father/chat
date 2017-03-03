(function() {
    // 配置
    var envir = 'test';
    var configMap = {
        test: {
            appkey: '358118cd796d8ee71474a9d768439bc5',
            url:'http://apiv6.chongfa.com/app/'
        },
        pre:{
    		appkey: '0418682317ea3a8f2d0a1e5eba6bcdc3',
    		url:'http://preapp.netease.im:8184'
        },
        online: {
           appkey: '358118cd796d8ee71474a9d768439bc5',
           // appkey: '0418682317ea3a8f2d0a1e5eba6bcdc3',
           url:'http://apiv5.chongfa.com/app/'
           // url:'https://app.netease.im'
        }
    };
    window.CONFIG = configMap[envir];
}())