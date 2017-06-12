/*
 * @Author: 消息逻辑
 */

'use strict'
YX.fn.message = function () {
    this.$sendBtn = $('#sendBtn')
    this.$messageText = $('#messageText')
    this.$chooseFileBtn = $('#chooseFileBtn')
    this.$fileInput = $('#uploadFile')
    this.$shouFees = $('#shouFees')//收取服务费界面
    this.$shouFeesSend = $('#shouFeesSend')//发送收取服务费消息
    this.$doFeesAgain = $('#doFeesAgain')//再次发送收取服务费消息
    // this.$exchangePhone = $('#exchangePhone')
    // this.$chooseImage = $('#chooseImge')
    this.$upFile = $('#upFile')

    // this.$exchangePhone.on('click', this.deleteLocalSession.bind(this))
    // this.$exchangePhone.on('click', this.exchangePhone.bind(this))


    this.$upFile.on('click', this.chatSndFile.bind(this))
    this.$doFeesAgain.on('click', this.doFeesAgain.bind(this))
    this.$shouFeesSend.on('click', this.shouFeesSend.bind(this))
    this.$shouFees.on('click', this.shouFees.bind(this))
    this.$sendBtn.on('click', this.sendTextMessage.bind(this))
    this.$messageText.on('keydown', this.inputMessage.bind(this))
    this.$chooseFileBtn.on('click', 'a', this.chooseFile.bind(this))
    this.$fileInput.on('change', this.uploadFile.bind(this))
    // this.$chooseImage.on('click',this.chooseImage.bind(this))
    //消息重发
    this.$chatContent.delegate('.j-resend','click',this.doResend.bind(this))
    //删除聊天
    $('#sessionsWrap').delegate('.delete-session-btn','click', this.deleteLocalSession.bind(this))
    //语音播发
    this.$chatContent.delegate('.j-mbox','click',this.playAudio)
    //聊天面板右键菜单
    //  $.contextMenu({
    //     selector: '.item-me .j-msg',
    //     callback: function(key, options) {
    //         if (key === 'delete') {
    //             var id = options.$trigger.parent().data('id')
    //             var msg = this.cache.findMsg(this.crtSession, id)
    //             if(!msg||options.$trigger.hasClass('j-msg')){
    //             }
    //             options.$trigger.removeClass('j-msg')
    //             this.nim.deleteMsg({
    //                 msg: msg,
    //                 done: function (err) {
    //                     options.$trigger.addClass('j-msg')
    //                     if(err){
    //                         if(err.code === 508){
    //                             alert('发送时间超过2分钟的消息，不能被撤回')
    //                         }else{
    //                             alert(err.message||'操作失败')
    //                         }
    //                     }else{
    //                         this.backoutMsg(id)
    //                     }
    //                 }.bind(this)
    //             })
    //         }
    //     }.bind(this),
    //     items: {
    //         "delete": {name: "撤回", icon: "delete"}
    //     }
    // })
    //表情贴图模块
    this.initEmoji()

}
/*****************************************************************
 * 聊天界面点击收取咨询费按钮
 ****************************************************************/
var toId
YX.fn.shouFees = function(){
    toId = this.crtSessionAccount
    shouFees(this.crtSessionAccount)
}
/*****************************************************************
 * 聊天界面点击附件按钮
 ****************************************************************/
YX.fn.chatSndFile = function(){
    chatSendFile(this.crtSessionAccount)
}
/**
 * 处理收到的消息
 * @param  {Object} msg
 * @return
 */
YX.fn.doMsg = function(msg){

    if(msg.to==userUID){
        console.log("deng,deng")
        playAudio(tipsAudio)
    }
    var that = this,
        who = msg.to === userUID ? msg.from : msg.to,
        updateContentUI = function(){
            //如果当前消息对象的会话面板打开
            if (that.crtSessionAccount === who) {
                that.sendMsgRead(who,msg.scene)
                var msgHtml = appUI.updateChatContentUI(msg,that.cache)
                that.$chatContent.find('.no-msg').remove()
                that.$chatContent.append(msgHtml).scrollTop(99999)
            }
        }
    //非群通知消息处理
    if (/text|image|file|audio|video|geo|custom|tip/i.test(msg.type)) {
        this.cache.addMsgs(msg)
        var account = (msg.scene==="p2p"?who:msg.from)
        //用户信息本地没有缓存，需存储
        if(!this.cache.getUserById(account)){
            this.mysdk.getUser(account,function(err,data){
                if(!err){
                    that.cache.updatePersonlist(data)
                    updateContentUI()
                }
            })
        }else{
            this.buildSessions()
            updateContentUI()
        }
    }else{
        // 群消息处理
        this.messageHandler(msg,updateContentUI)
    }
}
/*****************************************************************
 * emoji模块
 ****************************************************************/
YX.fn.initEmoji = function () {
    this.$showEmoji = $('#showEmoji')
    this.$showEmoji.on('click', this.showEmoji.bind(this))
    var that = this,
        emojiConfig = {
            'emojiList':emojiList,  //普通表情
            'pinupList':pinupList,  //贴图
            'width': 500,
            'height':300,
            'imgpath':'./images/',
            'callback':function	(result) {
                that.cbShowEmoji(result)
            }
        }
    this.$emNode = new CEmojiEngine($('#emojiTag')[0],emojiConfig)

}
/**
 * 选择表情回调
 * @param  {objcet} result 点击表情/贴图返回的数据
 */
YX.fn.cbShowEmoji = function(result){
    if(!!result){
        var scene = this.crtSessionType,
            to = this.crtSessionAccount
        // 贴图，发送自定义消息体
        if(result.type ==="pinup"){
            var index =Number(result.emoji) + 1
            var content = {
                type: 3,
                data: {
                    catalog: result.category,
                    chartlet:result.category+'0'+ (index>=10?index:'0'+index)
                }
            }
            this.mysdk.sendCustomMessage(scene, to, content,this.sendMsgDone.bind(this))
        }else{
            // 表情，内容直接加到输入框
            this.$messageText[0].value=this.$messageText[0].value+result.emoji
        }
    }
}

YX.fn.showEmoji = function(){
    this.$emNode._$show()
}
/*************************************************************************
 * 判断律师是否被禁言
 *data.info.ban'2'为禁言
 ************************************************************************/
var token=readCookie('sdktoken')
var ban
$.ajax({
    url: CONFIG.url + 'ban/info',
    type: 'POST',
    data: {
        'token': token
    },
    contentType: 'application/x-www-form-urlencoded',
    success: function (data) {
        if(data.info.ban=='2'){
            ban= false
        }else {
            ban =true
        }
    },
    error: function () {
        console.log('请求失败，请重试');
    }
});
/*************************************************************************
 * 发送消息逻辑
 *
 ************************************************************************/
YX.fn.uploadFile = function () {
    var that = this,
        scene = this.crtSessionType,
        to = this.crtSessionAccount,
        fileInput = this.$fileInput.get(0)
    if(fileInput.files[0].size==0){
        alert("不能传空文件")
        return
    }
    this.mysdk.sendFileMessage(scene, to, fileInput,this.sendMsgDone.bind(this))
}
//收咨询费*****************************************************************/
YX.fn.shouFeesSend= function () {
    var that=this,
        to = this.crtSessionAccount
    var feesMoney =$('#feesMoney');
    var feesReason =$('#feesReason');
    var reg2 = /^\d+(\.\d{2})?$/;
    if(feesMoney.val()==''){
        alert("金额不能为空")
        return false
    }else if(reg2.test(feesMoney.val())==false){
        feesMoney.val('')
        alert("只能输入整数或小数点后两位")
        return false
    }
    $.ajax({
        url: CONFIG.url+'money/lawyerFee',
        type: 'POST',
        data: {
            'token':token,
            'fee':feesMoney.val(),
            'userAccid':toId,
            'info':feesReason.val()
        },
        contentType: 'application/x-www-form-urlencoded',
        success: function(reponse){
            // console.log(reponse.info)
            $('#case-box').removeClass('unpop-modal');
        },
        error: function(){
            console.log('Ajax error!');
        }
    });
}
//重发服务费请求
YX.fn.doFeesAgain= function () {//mlid,details,time,money,toAccid
    var money = $('#showFeesMoney').html()
    var details = $('#showFeesDetails').html()
    var time = $('#showFeesTime').html()
    var mlid = $('#showFeesmlid').html()

    var timeYMD = time.substr(0,9)
    var timeHM = time.substr(10,17)
    var that = this,
        scene = this.crtSessionType,
        to = this.crtSessionAccount
    var content = {

    }

    var custom={
        "mlid":mlid,
        "details":details,
        "time":time,
        "toAccid":this.crtSessionAccount,
        "type":"14",
        "myAccid":userUID,
        "money":money
    }
    this.mysdk.sendCustomMessage(scene, to,content, custom,this.sendMsgDone.bind(this))
}
//交换电话*****************************************************************/
// YX.fn.exchangePhone= function () {
//     var that = this,
//         scene = this.crtSessionType,
//         to = this.crtSessionAccount,
//         phone=window.localStorage.getItem("phone")
//     var content = {
//
//                     }
//
//     var custom={
//                     "type": "2",
//                     "myAccid":userUID,
//                     "toAccid":this.crtSessionAccount,
//                     "tel": phone
//                 }
//     this.mysdk.sendCustomMessage(scene, to,content, custom,this.sendMsgDone.bind(this))
// }
//删除本地聊天记录
// function deleteSession(id) {
//     var that= this
//     // $('li[data-account='+id+']').remove()
//     console.log($('li[data-account='+id+']'))
//     // console.log(that.parents('li.panel_item'))
//     var newId='p2p-'+id
//     this.nim.deleteLocalSession({
//         id: newId,
//         done: deleteLocalSessionDone
//     });
//     function deleteLocalSessionDone(error, obj) {
//         console.log(error);
//         console.log(obj);
//         console.log('删除本地会话' + (!error?'成功':'失败'));
//     }
//     this.nim.deleteSession({
//         scene: 'p2p',
//         to: id,
//         done: deleteSessionDone
//     });
//     function deleteSessionDone(error, obj) {
//         console.log(error);
//         console.log(obj);
//         console.log('删除服务器上的会话' + (!error?'成功':'失败'));
//     }
// }
//删除本地聊天记录
/**
 * 删除本地、服务器上的会话
 * @param  {Funciton} done 回调
 * @return {void}
 */

YX.fn.deleteLocalSession = function (id,done,session) {
    //
    console.log('1111111111111111111111'+this.crtSession);
    nim.deleteLocalSession({
        id:this.crtSession,
        done: deleteLocalSessionDone
    })
    function deleteLocalSessionDone(error, obj) {
        console.log(error);
        console.log(obj);
        console.log('删除本地会话' + (!error?'成功':'失败'));
    }
    updateSessionsUI()
    // $("#sessionsWrap").html('')
    // nim.deleteSession({
    //     scene: 'p2p',
    //     to: this.crtSession,
    //     done: deleteSessionDone
    // });
    // function deleteSessionDone(error, obj) {
    //     console.log(error);
    //     console.log(obj);
    //     console.log('删除服务器上的会话' + (!error?'成功':'失败'));
    // }

}
//选择文件
YX.fn.chooseFile = function () {
    if(ban==false){
        alert("您已被禁言，无法发送消息")
        return false
    }
    this.$fileInput.click()
}

YX.fn.sendTextMessage = function () {
    var anid=readCookie('anid')
    $.ajax({
        url: 'http://cfm.chongfa.com/message/askNimMessageCount?anid='+anid,
        type: 'get',
        data: {},
        contentType: 'application/x-www-form-urlencoded'
    });

    var scene = this.crtSessionType,
        to = this.crtSessionAccount,
        text = this.$messageText.val().trim()
    if ( !! to && !! text) {
        if (text.length > 500) {
            alert('消息长度最大为500字符')
        }else if(text.length===0){
            return
        } else {
            this.mysdk.sendTextMessage(scene, to, text, this.sendMsgDone.bind(this))
            console.log('sessionid='+this.crtSession)
        }
    }
}
//=====================
function sendMsg(text) {

    var msg = nim.sendText({
        scene: 'p2p',
        to: GetQueryString('toaccid'),
        text: 'hello',
        done: sendMsgDone
    });
    console.log('正在发送p2p text消息, id=' + msg.idClient);
    function sendMsgDone(error, msg) {
        console.log(error);
        console.log(msg);
        console.log('发送' + msg.scene + ' ' + msg.type + '消息' + (!error?'成功':'失败') + ', id=' + msg.idClient);
    }
}
/**
 * 发送消息完毕后的回调
 * @param error：消息发送失败的原因
 * @param msg：消息主体，类型分为文本、文件、图片、地理位置、语音、视频、自定义消息，通知等
 */
YX.fn.sendMsgDone = function (error, msg) {
    this.cache.addMsgs(msg)
    this.$messageText.val('')
    this.$chatContent.find('.no-msg').remove()
    var msgHtml = appUI.updateChatContentUI(msg,this.cache)
    this.$chatContent.append(msgHtml).scrollTop(99999)
    // $('#uploadForm').get(0).reset()
    $('#showFeesHtml').removeClass('unpop-modal');
}

YX.fn.inputMessage = function (e) {
    var ev = e || window.event
    if ($.trim(this.$messageText.val()).length > 0) {
        if (ev.keyCode === 13 && ev.ctrlKey) {
            this.$messageText.val(this.$messageText.val() + '\r\n')
        } else if (ev.keyCode === 13 && !ev.ctrlKey) {
            this.sendTextMessage()
        }
    }
}
// 重发
YX.fn.doResend = function (evt) {
    var $node
    if(evt.target.tagName.toLowerCase() === 'span'){
        $node = $(evt.target)
    } else {
        $node = $(evt.target.parentNode)
    }
    var sessionId = $node.data("session")
    var idClient = $node.data("id")
    var msg = this.cache.findMsg(sessionId, idClient)
    this.mysdk.resendMsg(msg, function(err,data){
        if(err){
            alert(err.message||'发送失败')
        }else{
            this.cache.setMsg(sessionId,idClient,data)
            var msgHtml = appUI.buildChatContentUI(sessionId,this.cache)
            this.$chatContent.html(msgHtml).scrollTop(99999)
            $('#uploadForm').get(0).reset()
        }
    }.bind(this))
}
/************************************************************
 * 获取当前会话消息
 * @return {void}
 *************************************************************/
YX.fn.getHistoryMsgs = function (scene,account) {
    var id = scene + "-" + account;
    var sessions = this.cache.findSession(id)
    var msgs = this.cache.getMsgs(id)
    //标记已读回执
    this.sendMsgRead(account, scene)
    if(!!sessions){
        if(sessions.unread>=msgs.length){
            var end = (msgs.length>0)?msgs[0].time:false
            this.mysdk.getLocalMsgs(id,end,this.getLocalMsgsDone.bind(this))
            return
        }
    }
    this.doChatUI(id)
}
//拿到历史消息后聊天面板UI呈现
YX.fn.doChatUI = function (id) {
    var temp = appUI.buildChatContentUI(id,this.cache)
    this.$chatContent.html(temp)
    this.$chatContent.scrollTop(9999)
    //已读回执UI处理
    this.markMsgRead(id)
}

YX.fn.getLocalMsgsDone = function(err,data){
    if(!err){
        this.cache.addMsgsByReverse(data.msgs)
        var id = data.sessionId
        var array = getAllAccount(data.msgs)
        var that = this
        this.checkUserInfo(array, function() {
            that.doChatUI(id)
        })
    }else{
        alert("获取历史消息失败")
    }
}

//检查用户信息有木有本地缓存 没的话就去拿拿好后在执行回调
YX.fn.checkUserInfo = function (array,callback) {
    var arr = []
    var that = this
    for (var i = array.length - 1; i >= 0; i--) {
        if(!this.cache.getUserById(array[i])){
            arr.push(array[i])
        }
    }
    if(arr.length>0){
        this.mysdk.getUsers(arr,function(error,data){
            if(!error){
                that.cache.setPersonlist(data)
                callback()
            }else{
                alert("获取用户信息失败")
            }
        })
    }else{
        callback()
    }
}
//发送已读回执
YX.fn.sendMsgRead = function(account, scene){
    if(scene==="p2p"){
        var id = scene+"-"+account
        var sessions = this.cache.findSession(id)
        this.mysdk.sendMsgReceipt(sessions.lastMsg,function(err,data){
            if(err){
                console.log(err)
                chatroom.connect()
                // document.location.reload()
            }
        })
    }
}
//UI上标记消息已读
YX.fn.markMsgRead = function(id){
    if(!id||this.crtSession!==id){
        return
    }
    var msgs = this.cache.getMsgs(id)
    for (var i = msgs.length-1;i>=0; i--) {
        var message = msgs[i]
        // 目前不支持群已读回执
        if(message.scene==="team"){
            return
        }
        if(window.nim.isMsgRemoteRead(message)){
            $(".item.item-me.read").removeClass("read")
            $("#"+message.idClient).addClass("read")
            break
        }
    }
}
//撤回消息
// YX.fn.backoutMsg = function(id, data){
//     var msg = data? data.msg : this.cache.findMsg(this.crtSession, id)
//     var to  = msg.target
//     var session = msg.sessionId
//     this.nim.sendTipMsg({
//         isLocal: true,
//         scene: msg.scene,
//         to: to,
//         tip: (userUID === msg.from ? '你' : getNick(msg.from)) + '撤回了一条消息',
//         time: msg.time,
//         done: function (err, data) {
//             if(!err){
//                 this.cache.backoutMsg(session, id, data)
//                 if(this.crtSession === session){
//                     var msgHtml = appUI.buildChatContentUI(this.crtSession, this.cache)
//                     this.$chatContent.html(msgHtml).scrollTop(99999)
//                 }
//             }else{
//                 alert('操作失败')
//             }
//         }.bind(this)
//     })
// }

//播放声音
function playAudio(tipsAudio) {
    var playing = false, currentAudio = null;
    var $audio = $(tipsAudio)
    if (playing) {
        playing = false;
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
    playing = true;
    currentAudio = $audio.get(0);
    currentAudio.play();

}
