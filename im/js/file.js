//获取参数
var token=readCookie('sdktoken')
function chatSendFile(toAccid){
    $('#question-loading1').removeClass('hide')
    $('#mobileFileList').html('')
    $('#mobileFileListSent').html('')
    toaccid=toAccid
    fileReceive()
    fileUpload()
    $('#sendFile').addClass('unpop-modal')
    event.stopPropagation();
}
$('#sendFile').click(function () {
    event.stopPropagation();
})
var url ='http://api.chongfa.com/'

//接收的文件
function fileListReceive(page) {
    // alert(1)
    $.ajax({
        url: url+'v6/cloud/lsCloudAttachment',
        type: 'POST',
        data: {
            'token': token,
            'app':'test',
            'cate':'2',
            'page':page
        },
        contentType: 'application/x-www-form-urlencoded',
        success: function(data) {
            if(data.state=="success"){
                if(data.info.page_current=='1'&&data.info.data==''||data.info.page_current=='1'&&data.info.data==null){
                    $('#noFlileReceive').removeClass('hide')
                    $('#fileReceiveBox').addClass('hide')
                    $('#noFlileReceiveError').addClass('hide')
                }else {
                    $('#noFlileReceive').addClass('hide')
                    $('#fileReceiveBox').removeClass('hide')
                    $('#noFlileReceiveError').addClass('hide')
                    $('#listMore').removeClass('hide')
                    if(data.info.data==''||data.info.data==null){
                        $('#listMore').html('没有更多了')
                    }else {
                        $('#listMore').html('加载更多')
                    }
                }
                var html = ''
                for (var i=0 ;i<data.info.data.length;i++){
                    html+='<li onclick="receiveFile()" class="cursor">'+
                        '<div class="mobile-file-list-left">'+
                        '<img src="images/files.png" alt="">'+
                        '</div>'+
                        '<div class="mobile-file-list-mid">'+data.info.data[i].ca_name+'</div>'+
                        '<div class="mobile-file-list-right">'+getLocalTime(data.info.data[i].ca_time)+'</div>'+
                        '</li>'
                }
                $('#mobileFileList').append(html)
                $('#question-loading1').addClass('hide')
            }else {
                $('#noFlileReceive').addClass('hide')
                $('#fileReceiveBox').addClass('hide')
                $('#noFlileReceiveError').removeClass('hide')
                console.log('数据请求失败，请重试');
            }
        },
        error: function() {
            $('#noFlileReceive').addClass('hide')
            $('#fileReceiveBox').addClass('hide')
            $('#noFlileReceiveError').removeClass('hide')
            console.log('请求失败，请重试');
        }
    })
}
//上传的文件
function fileListUpload(page) {
    $.ajax({
        url: url+'v6/cloud/lsCloudAttachment',
        type: 'POST',
        data: {
            'token':token,
            // 'app':'test',
            'cate':'1',
            'page':page
        },
        contentType: 'application/x-www-form-urlencoded',
        success: function(data) {
            if(data.state=="success"){
                if(data.info.page_current=='1'&&data.info.data==''||data.info.page_current=='1'&&data.info.data==null){
                    $('#myNoFile').removeClass('hide')
                    $('#myFileBox').addClass('hide')
                    $('#myNoFileError').addClass('hide')
                }else {
                    $('#myNoFile').addClass('hide')
                    $('#myNoFileError').addClass('hide')
                    $('#myFileBox').removeClass('hide')
                    $('#listMore1').removeClass('hide')
                    if(data.info.data==''||data.info.data==null){
                        $('#listMore1').html('没有更多了')
                    }else {
                        $('#listMore1').html('加载更多')
                    }
                }
                var html = ''
                for (var i=0 ;i<data.info.data.length;i++){
                    html+='<li class="cursor" onclick="sendFile(\''+token+'\',\''+toaccid+'\',\''+data.info.data[i].caid+'\',\''+data.info.data[i].ca_name+'\')">'+
                        // html+='<li onclick="sendFile(\''+data.info.data[i].ca_name+'\')">'+
                        '<div class="mobile-file-list-left">'+
                        '<img src="images/files.png" alt="">'+
                        '</div>'+
                        '<div class="mobile-file-list-mid">'+data.info.data[i].ca_name+'</div>'+
                        '<div class="mobile-file-list-right">'+getLocalTime(data.info.data[i].ca_time)+'</div>'+
                        '</li>'
                }
                $('#mobileFileListSent').append(html)
                $('#question-loading1').addClass('hide')
            }else {
                console.log('数据请求失败，请重试');
                $('#question-loading1').addClass('hide')
                $('#myNoFile').addClass('hide')
                $('#myNoFileError').removeClass('hide')
                $('#myFileBox').addClass('hide')
            }
        },
        error: function(date) {
            $('#question-loading1').addClass('hide')
            $('#myNoFile').addClass('hide')
            $('#myNoFileError').removeClass('hide')
            $('#myFileBox').addClass('hide')
            console.log('请求失败，请重试');
        }
    })
}
//时间戳转日期
function getLocalTime(data) {
    var date = new Date(data*1000);
    Y = date.getFullYear() + '.';
    M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '.';
    D = date.getDate()<10 ? '0'+date.getDate() : date.getDate() ;
    h = date.getHours()<10 ? '0' + date.getHours() : date.getHours() ;
    m = date.getMinutes()<10 ? '0' + date.getMinutes() : date.getMinutes() ;
    s = date.getSeconds();
    return date=Y+M+D+'&nbsp'+h+ ':'+m;
}
//点击加载更多（接收tab下）
function fileReceive(){
    var page = 1
    // /*首次加载*/
    fileListReceive( page);
    /*监听加载更多*/
    $('#listMore').click(function(){
        page ++;
        fileListReceive(page);
    });
}
//点击加载更多（我的上传tab下）
function fileUpload(){
    var page = 1
    // /*首次加载*/
    fileListUpload( page);
    /*监听加载更多*/
    $('#listMore1').click(function(){
        page ++;
        fileListUpload(page);
    });
}
//发送消息
function receiveFile() {//收到的文件提示下载信息
    showModal1()
}
function sendFile(token,toAccid,caid,filename) {//上传的文件提示是否发送
    showModal2(token,toAccid,caid,filename)
}
//tab切换
$('.mobile-tab a').on('click',function () {
    $(this).addClass('active').siblings().removeClass('active')
    var src = $(this).attr('href')
    $(src).removeClass('hide').siblings().addClass('hide')
    return false
})
//提示框信息

$('#fileModal1Close1').click(function () {
    $('#fileModal1').removeClass('active')
})
function showModal1() {
    $('#fileModal1').addClass('active')
}
$('#fileModal1').click(function () {
    $(this).removeClass('active')
})
$('#fileModal2').click(function () {
    $(this).removeClass('active')
})
$('.file-modal').click(function () {
    event.stopPropagation()
})
function showModal2(token,toAccid,caid,filename) {
    $('#fileModal2Txt').html('是否发送文件<br><span class="color-blue pt5">'+filename+'</span>')
    $('#fileModal2').addClass('active')
    $('.btn-cancel').unbind().bind('click',function () {
        $('#fileModal2').removeClass('active')
        return false
    })
    $('.btn-send').unbind().bind('click',function () {
        $.ajax({//发送文件参数
            url: url+'v6/push/cloudFilePush',
            type: 'POST',
            data: {
                'token':token,
                'app':'test',
                'caid':caid,
                'toAccid':toAccid
            },
            contentType: 'application/x-www-form-urlencoded',
            success: function(data) {
                console.log(JSON.stringify(data))
                if(data.state=="success"){
                    console.log(JSON.stringify(data))
                    $('#sendFile').removeClass('unpop-modal')
                }else {
                    console.log('数据请求失败，请重试');
                }
            },
            error: function() {
                console.log('请求失败，请重试');
            }
        })
        $('#fileModal2').removeClass('active')
    })
}
//重新加载
$('.reload').click(function () {
    document.location.reload()
})