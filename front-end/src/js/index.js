//引入第三方资源，地址基于node_module
import 'jquery/dist/jquery.min'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min'
import '../css/header-footer.css'
import '../css/index.css'
import '../css/tests.css'
import '../css/modal.css'
import cover_1 from '../image/test-cover01.png'
import cover_2 from '../image/test-cover02.png'
import cover_3 from '../image/test-cover03.png'
import cover_4 from '../image/test-cover04.png'
import cover_5 from '../image/test-cover05.png'
import cover_6 from '../image/test-cover06.png'
import moment from "moment";
import * as Util from './util'
import {
    init
} from './analyzeToken'
import * as Loading from './loading'

let id;
$(async function () {
    // 显示loading页面
    $('#loading-mask').fadeIn(10)
    let user = await init()
    // 从token中解析信息，获取id
    if(sessionStorage.getItem('announce')==null){
        sessionStorage.setItem('announce', false)
        //  进入首页，显示公告弹窗
        $('#announcementModal').modal('show');
    }
    let now;
    if (location.search) {
        now = location.search.split('main=')[1];
        $('main').removeClass('active')
        $(`main.${now}`).addClass('active')
        // 没有点击，默认是每日一测，typeId表示类型为每日一测
        $('main.tests').data('typeId', '6256338f1a34000097001cc6')
    } else {
        // 检查当前页面是index还是tests试卷页面
        now = $('main.active').attr('class').split(' ')[0];
    }
    //console.log(now);
    if (user) {
        id = user._id
        // //console.log(now);
        $('main').css('display', 'none')
        $(`main.${now}`).fadeIn(300);
        // id = 
        // id = data.data['_id']
        // // getRank()
        // //FIXME 回调地狱
        // // //console.log(now);
        initIndex()
        getStatistics()
        renderTestList()
        setTimeout(function () {
            clearInterval(Loading.timer)
            $('#loading-mask').fadeOut(200)
        }, 500)
    } else if (now == 'tests') {
        if (confirm('请先登录！')) {
            location.href = `login.html`
        }
    }
})

function initIndex() {
    //无论是否登录，都渲染考试类型文字 types接口
    $.ajax({
        url: '/types/render',
        type: 'GET',
        success: function (data) {
            // 渲染考试文字
            // //console.log(data);
            let spanGroup = $('.intro-list .display-card span')
            // //console.log(data.data[0]['type']);
            spanGroup.each(i => {
                spanGroup.eq(i).text(data.data[i]['type'])
                // //console.log(data.data[i]['_id']);
                spanGroup.eq(i).parents('.display-card').data('type', data.data[i]['_id'])
            })
        }
    })
}

$('.intro-list .display-card').on('click', function (e) {
    if (id!=undefined&&id!=null) {
        // 切换页面
        $(`main.index`).toggleClass('active').fadeToggle(300);
        $(`main.tests`).toggleClass('active').fadeToggle(300);
        // 回到顶部
        $('body,html').animate({
            scrollTop: 0
        }, 300)
        // // 切换导航栏样式
        $(`.nav-ul li`).removeClass('active').parent().find(`li.tests`).addClass('active')
        // //console.log($(`.nav-ul li`).find(`a.${name}`));

        // 调用试卷列表渲染函数,传testId
        let typeId = $(this).data('type');
        // //console.log(typeId);
        $('main.tests').data('typeId', typeId)
    }else{
        alert('请用户登录后再查看试卷信息')
    }
})

function getStatistics() {
    // 动态渲染 用户数据统计信息
    // //console.log(id);
    $.ajax({
        url: `/students/${id}`,
        type: 'POST',
        success: function (data) {
            if (data.code == 200) {
                console.log(data.data);
                // 渲染对应的数据
                renderStatistics(data.data)
            }
        }
    })
}

//渲染对应数据统计
function renderStatistics(info) {
    // //console.log('test');
    let spanGroup = $('.circle-box span span');
    // //console.log(spanGroup);
    spanGroup.each(function (i) {
        let attr = $(this).attr('name') 
        $(this).text(parseInt(info[attr]*100)/100||0)
    })
}

function renderTestList() {
    // 从后端获取所有试卷列表，以及所以已经考过的试卷的列表
    // 筛选已经考过的试卷，传入学生id，在后端查询所有包含该学生id的试卷
    // 上半部分--可以参加的考试：有效1 + 未考过 (所有-该学生考过)

    // 当前学生id
    //获取该学生参加过得所有考试的id
    let testIds = [];
    let testedIds = [];
    let durations = []
    $.ajax({
        url: `/tests/${id}`,
        type: 'get',
        success: function (data) {
            testIds = data.stuTested;
            testedIds = data.testedIds
            durations = data.durations
            getTestList(testIds, testedIds,durations)
        }
    })
}



function getTestList(testedIds, _ids,duration) {
    // //console.log(duration);
    // //console.log(id);
    //存可以参加的考试的试卷id，唯一 testId
    let todoTest = []
    let doneTest = []
    $.ajax({
        url: '/tests',
        type: 'GET',
        success: function (data) {
            //储存所有试卷的信息
            let allList = data.data;
            allList.forEach((test,i) => {
                let index = testedIds.indexOf(test['_id'])
                if (index > -1) {
                    // 已考过包含正在进行考试的项目即，分数为null
                    // //console.log(duration[index]);
                    // 判断：durations | 分隔的后一位是否超过现在的时间
                    // !=undefined?duration[i].durations:null
                    let lastTime = duration[index].split('|')[1]||null
                    // lastTime==null表示考试已经结束了
                    //console.log(lastTime,moment(lastTime).isSameOrBefore(moment()));
                    if(lastTime!=null&&moment(lastTime).isSameOrBefore(moment())){
                    //     // 已经过期,考试超时，自动结束，进入done
                        // //console.log(test);
                        doneTest.push([test, _ids[index],'expired'])
                    }else if(lastTime==null){
                        //考试已结束，当前值包含’分钟‘，是计算后的结果
                        doneTest.push([test, _ids[index],''])
                    }else{
                        // 未过期，进入todo
                        todoTest.push([test,'emergency'])
                    }
                } else {
                    if (test.form == 1) {
                        todoTest.push(test)
                    }
                }
            })
            // //console.log(doneTest, todoTest);
            // 只存储未考过的试卷，即！=testedId
            if (doneTest.length == 0) {
                // 当前没有参加过考试
                $('#done-tests').css('visibility', 'hidden')
                // let $newP = $('<p>当前还没有参加过一次完整的考试哦</p>');
                // $('#done-tests').html('').append($newP);
            } else {
                $('#done-tests').css('visibility', 'visible')
                createDoneTests(doneTest)
            }
            createTodoList(todoTest)
        }
    })
}

function createDoneTests(list) {
    let imagesGroup = [cover_1, cover_2, cover_3, cover_4, cover_5, cover_6]
    let inner = $('#done-tests')[0].innerHTML
    // console.log(inner);
    $('#done-tests').html(inner)

    list.forEach((infos, i) => {
        // 检查是否需要修改状态
        let state = ['已完成','']
        //console.log(infos[2]);
        if(infos[2]=='expired'){
            // 标注考试超时，可以查看解析
            state = ['考试超时','expired']
        }
        let info = infos[0]
        let schedule = Util.getTestSchedule(info)
        // let minutes = info.durations.slice(0, -2)
        // let day = info.startTime.split('/').concat(info.date)
        // day[1]--;
        // let start = moment(day).format("YYYY-MM-DD HH:mm")
        // let end = moment(day).add(minutes, 'm').format("YYYY-MM-DD HH:mm")
        // if(info[2])
        let pic = Math.floor(Math.random() * 6)
        // //console.log(pic,imagesGroup[pic]);
        let $newList =
            $(`<div class="test-list" data-id="${info._id}">
        <img src=${imagesGroup[pic]} alt="">
        <div class="text-part">
            <p>${info.title}<span class="tag theme-btn done ${state[1]}">${state[0]}</span></p>
        <p><span>${schedule}</span><span class="limited-time">限时${info.durations}</span>
        </div>
        <button class="theme-btn">查看</button>
    </div>`)
        // //console.log($newList);
        // $newList.find('img').attr('src', )
        // //console.log($newList.find('img'));
        $newList.on('click', 'button', function (e) {
            // //console.log($(this).parents('.test-list').data('id'));
            let testId = $(this).parents('.test-list').data('id')
            // //console.log(id);
            // console.log(infos[1],state[1]);
            let typeId = $('main.tests').data('typeId')
            location.href = `answers.html?info=${infos[1][0]}&${state[1]}`
        })
        // //console.log($newList.find('img'));
        // 添加进试卷列表
        $('#done-tests').append($newList)
    })
}

function createTodoList(list) {
    let imagesGroup = [cover_1, cover_2, cover_3, cover_4, cover_5, cover_6]
    // //console.log(cover_1);
    let inner = $('#todo-tests')[0].innerHTML
    console.log(inner);
    $('#todo-tests').html('').append(inner)
    list.forEach((info, i) => {
        let state;
        if(info.length > 1) {
            // //console.log(info);
            state = ['正在进行',info[1]]
            info = info[0];
        }else{
            state = ['可参加','']
        }
        // //console.log(info);
        // let minutes = info.durations.slice(0, -2)
        // let day = info.startTime.split('/').concat(info.date)
        // day[1]--;
        // let start = moment(day).format("YYYY-MM-DD HH:mm")
        // let end = moment(day).add(minutes, 'm').format("YYYY-MM-DD HH:mm")
        let schedule = Util.getTestSchedule(info)
        let pic = Math.floor(Math.random() * 6)
        let $newList =
            $(` <div class="test-list" data-id="${info._id}">
    <img src=${imagesGroup[pic]} alt="">
    <div class="text-part">
        <p>${info.title}<span class="tag theme-btn todo ${state[1]}">${state[0]}</span></p>
        <p><span>${schedule}</span><span class="limited-time">限时${info.durations}</span>
        </p>
    </div>
    <button class="theme-btn ${state[1]}">进入</button>
    </div>`)
        $newList.find('img').attr('src', imagesGroup[pic])
        $newList.on('click', 'button', function (e) {
            let testId = $(this).parents('.test-list').data('id')
            // 跳转页面，传testId信息
            // //console.log(id);
            let typeId = $('main.tests').data('typeId')
            location.href = `tests-basic-info.html?test=${testId}&stu=${id}&type=${typeId}`
            // //console.log();
        })
        // //console.log($newList.find('img'));
        // 添加进试卷列表
        $('#todo-tests').append($newList)
    })
}

//点击首页span标签，跳转到首页
$('.purple').on('click', function (e) {
    location.href = "index.html"
})