function newQuestion(page) {//最新问题异步请求
    $('#question-loading').removeClass('hide')
    $.ajax({
        url: CONFIG.url + 'ask/news',
        type: 'POST',
        data: {
                'token':token,
                'page':page
            },
        contentType: 'application/x-www-form-urlencoded',
        success: function(reponse){
            if(reponse.info==''){
                $('.no-question').html('暂无问题')
            }else {
                $('.no-question').remove()
                var sum = reponse.info.length;
                var result = '';
                for(var i=0; i< sum; i++){
                    var a_money = reponse.info[i].a_money
                    if (a_money=='0.00'||a_money==''||a_money==null){
                        a_money=''
                    }else {
                        a_money='<span class="fr color-orange w100-span tr">悬赏'+reponse.info[i].a_money+'￥</span>'
                    }
                    result +='<li class="cursor" onclick="showQuestion('+reponse.info[i].aid+')">' +
                        '<p class="chat-question-list-title"><span class="fl">'+reponse.info[i].nickname+' <small>'+getLocalTime(reponse.info[i].a_time)+'</small></span>'+a_money+'</p>'+
                        '<p class="chat-question-list-txt">'+reponse.info[i].a_content+'</p>'+
                        '</li>' ;
                }
                $('#chat_zxwt ul').append(result);
            }
            $('#question-loading').addClass('hide')

//                $('#lawyer_communication_list').append(result);
            /*隐藏more按钮*/
            if ( reponse.info==''){
                $("#questionMore").hide();
            }else{
                $("#questionMore").show();
            }
        },
        error: function(){
            console.log('Ajax error!');
        }
    });
}

function recommendQuestion(page) {//推荐问题异步请求
    $('#question-loading').removeClass('hide')
    $.ajax({
        url: CONFIG.url + 'ask/recommend',
        type: 'POST',
        data: {
            'token':token,
            'page':page
        },
        contentType: 'application/x-www-form-urlencoded',
        success: function(reponse){
            // console.log('最新问题'+reponse)
            var sum = reponse.info.length;
            var result = '';
            for(var i=0; i< sum; i++){
                var a_money = reponse.info[i].a_money
                if (a_money=='0.00'||a_money==''||a_money==null){
                    a_money=''
                }else {
                    a_money='<span class="fr color-orange w100-span tr">悬赏'+reponse.info[i].a_money+'￥</span>'
                }
                result +='<li class="cursor" onclick="showQuestion('+reponse.info[i].aid+')">' +
                    '<p class="chat-question-list-title"><span class="fl">'+reponse.info[i].nickname+' <small>'+getLocalTime(reponse.info[i].a_time)+'</small></span>'+a_money+'</p>'+
                    '<p class="chat-question-list-txt">'+reponse.info[i].a_content+'</p>'+
                    '</li>' ;
            }
            $('#question-loading').addClass('hide')
            $('#chat_tjwt ul').append(result);
            /*隐藏more按钮*/
            if ( reponse.info==''){
                $("#questionMore1").hide();
            }else{
                $("#questionMore1").show();
            }
        },
        error: function(){
            console.log('Ajax error!');
        }
    });
}

//问题页面点击问题 列表查看问题详情
function showQuestion(aid) {
    var html=''
    var reply=''
    var token=readCookie('sdktoken')
    $('#chat_zxwt_detail').empty()
    $('#question-loading1').removeClass('hide')
    $.ajax({
        url: CONFIG.url+'ask/getInfoByAid',
        type: 'POST',
        data: {
            'token': token,
            'aid':aid
        },
        contentType: 'application/x-www-form-urlencoded',
        success: function(data) {
            if(data.state=="success"){
                var caseTime = getLocalTime(data.info.ask.a_time);//转换时间戳
                var c_money = data.info.ask.a_money;
                var MoneyBox = ''
                if(c_money==null||c_money=='0.00'||c_money==''){//判断是否有悬赏金额
                    MoneyBox =''
                }else {
                    MoneyBox ='<span class="chat-tips-xs">悬赏'+c_money+'￥</span>'
                }
                switch (data.info.ask.a_state){   //判断 案件状态（0:未审核；1:已审核；2:已解决；3:已关闭；）
                    case '1':
                        var caseForm ='<div class="chat-question-detail-input"><p><i class="fa fa-edit">&nbsp;我要回答</i></p>' +
                            '<form ><textarea class="chat-question-detail-input-txt" autofocus="autofocus" id="questionReplyTextarea"></textarea>' +
                            '<div class="tr chat-question-send"><span>Ctrl+Enter</span><a class="btn chatreply" onclick="chatReplyQuestion('+aid+','+'\'#questionReplyTextarea\')" id="questionReplyBtn">提交回答</a></div></form>' +
                            '</div> ';
                        break;
                    case '2':
                        var caseForm = '<div class="chat-question-detail-input"><div class="case-state"><img src="images/case_state2.png" alt=""></div></div>';
                        break;
                    case '3':
                        var caseForm = '<div class="chat-question-detail-input"><div class="case-state"><img src="images/case_state3.png" alt=""></div></div>';
                        break
                }
                if(data.info.ask.headpic==''){
                    data.info.ask.headpic='images/default-icon.png'
                }

                //回复详情
                var answerList=''
                var arTips=''
                for(i=0;i<data.info.reply.length;i++){
                    if(data.info.reply[i].headpic==''){
                        data.info.reply[i].headpic='images/default-icon.png'
                    }
                    if(data.info.reply[i].ar_tips=='1'){
                        arTips='<span class="fr color-orange f12">已采纳</span>'
                    }else {
                        arTips=''
                    }
                    answerList+= '<li class="position-re">' +
                        '<img src="'+data.info.reply[i].headpic+'" alt="" class="chat-answer-list-avata">' +
                        '<div class="chat-answer-list-txt">' +
                        '<p class="chat-answer-list-title">'+data.info.reply[i].nickname+' <small>'+getLocalTime(data.info.reply[i].ar_time)+'</small>'+arTips+'</p>' +
                        '<p class="chat-answer-list-detail">'+data.info.reply[i].ar_con+'</p>' +
                        '</div>' +
                        '</li>'
                }
                reply = '<div class="chat-answer-box">' +
                    '<div class="chat-answer-box-title">' +
                    '<span>律师回复</span>' +
                    '</div>' +
                    '<div class="chat-answer-list">' +
                    '<ul>'+answerList+'</ul>' +
                    '</div>' +
                    '</div>';
                //问题详情
                html ='<div class="chat-question-detail-avatar">' +
                    '<img src="'+data.info.ask.headpic+'" alt="" class="chat-question-detail-avatar-img">'+
                    '<div class="chat-question-detail-avatar-title">' +
                    '<p class="chat-question-detail-avatar-title1">'+data.info.ask.nickname+'</p>' +
                    '<p class="chat-question-detail-avatar-title2">'+caseTime+'</p><span class="j-account hide j-username" >'+data.info.ask.accid+'</span>'+
                    '</div>' +'<span class="ml15 j-chat f12 cursor color-lsrz"><i class="fa fa-comments f20 pt5 pl10 pr5 color-lsrz cursor"></i>立即沟通</span>'+
                    // '</div>' +'<span class="btn btn-info ml15" onclick="YX.fn.doChat1(\''+data.info.ask.accid+'\',\''+'p2p'+'\')">立即沟通</span>'+
                    '<div class="chat-question-detail-avatar-tag">'+MoneyBox+'<span class="chat-tips-hyjt">'+data.info.ask.a_cate+'</span></div></div>' +
                    '<div class="chat-question-detail-txt">'+data.info.ask.a_content+'</div>' +
                    caseForm+reply;
                $('#question-loading1').addClass('hide')
                $('#chat_zxwt_detail').html(html)
                event.stopPropagation()
            }else {
                console.log('个人信息数据请求失败，请重试');
            }
        },
        error: function() {
            console.log('请求失败，请重试');
        }
    })
}
//问题页面---回复问题
function chatReplyQuestion(aid,chatReplyTextarea) {
    var chatReplyTextarea=$(chatReplyTextarea).val();
    if(ban==false){
        alert("您已被禁言，无法发送消息")
        return false
    }
    if(chatReplyTextarea==''){
        alert("回复内容不能为空")
        event.stopPropagation();
        return false
    }else {
        $.ajax({
            url: CONFIG.url + 'ask/reply',
            type: 'POST',
            data: {
                'token': token,
                'aid': aid,
                'con':chatReplyTextarea
            },
            contentType: 'application/x-www-form-urlencoded',
            success: function (data) {
                showQuestion(aid)
                console.log(data);
            },
            error: function () {
                console.log('发送失败，请重试');
            }
        })
    }
}
//点击加载更多最新问题
$(function(){
    var page = 1
    // /*首次加载*/
    newQuestion( page);
    /*监听加载更多*/
    $(document).on('click', '#questionMore', function(){
        page ++;
        newQuestion(page);
    });
});
//点击加载更多推荐问题
$(function(){
    var page = 1
    /*监听加载更多*/
    $(document).on('click', '#questionMore1', function(){
        page ++;
        recommendQuestion(page);
    });
});
//tab切换绑定事件
$('#lastestNews').click(function () {
    $('.chat-question-list-new ul').empty()
    newQuestion(1)
})
$('#recondNews').click(function () {
    $('.chat-question-list-new ul').empty()
    recommendQuestion(1)
})
$('.chat-question-list-new ul').delegate('li','click',function () {
    // alert($(this.li))
    $(this).addClass('active').siblings().removeClass('active')
})