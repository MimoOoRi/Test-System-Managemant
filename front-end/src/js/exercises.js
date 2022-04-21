//引入第三方资源，地址基于node_module
import 'jquery/dist/jquery.min'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'
import '../css/header-footer.css'
import '../css/exercises.css'
import 'font-awesome/css/font-awesome.css'
import moment from "moment";
import * as Util from './util'
import * as Loading from './loading'
import * as Token from './analyzeToken'

// 页面渲染
let testId = location.search.substring(1).split('&')[0].split('=')[1]
// 获取学生id
let stuId = location.search.substring(1).split('&')[1].split('=')[1]
let typeId = location.search.substring(1).split('&')[2].split('=')[1]
// let singleAnsArr;
// let multiAnsArr;
let testInfo;
let single = [];
let multi = []
let exGroupId = []
let timer = null;
let stuAns;

$(async function () {
    // 显示loading页面
    $('#loading-mask').fadeIn(10)
    // 当前试卷是否已经被打开过
    let user = await Token.init()
    if (user) {
        let already = await getAjax(`/testeds/${stuId}/${testId}`, 'get')
        // 异步获取所有试题，分配单选或多选 
        let testRe = await getAjax(`/tests/${testId}`, 'post')
        exGroupId = testRe.data.exIds;
        // 渲染title
        $('h3').text(testRe.data.title)
        // console.log(exGroupId);
        let exRe = await getAjax(`/exercises/${exGroupId}`, 'get')
        testInfo = exRe.data;
        // 将testedId作为main-content的自定义属性
        stuAns = JSON.parse(sessionStorage.getItem('ans')) || {}
        // console.log(stuAns);
        // 渲染答题卡
        renderAnswerCard(testInfo)
        // 将当前打开开始时间存进数据库
        // let testedId = $('.main-content').data('timeId')

        // console.log(already);
        console.log(already.data?.score == null);
        if (already.data?.score == null) {
            let testedId = already.data?._id
            let endTime = already.data?.durations.split('|')[1]
            let startTime = already.data?.durations.split('|')[0]
            // 当前试卷未提交，答案长度为null，继续计时
            if (testedId == undefined) {
                // 没有数据
                startTime = moment().format("YYYY-MM-DD HH:mm:ss")
                let re = await getAjax(`/tests/${testId}/${stuId}/${typeId}`, 'post')
                let minutes = Number(re.info.durations.slice(0, -2))
                // console.log(minutes);
                // 当前时间和startTimer的差值
                endTime = moment(startTime).add(minutes, 'm').format("YYYY-MM-DD HH:mm:ss")
                testedId = await setTimer(startTime, endTime)
            }
            renderTimer(endTime)
            renderProgress()
            console.log('start!!!');
            $('.main-content').data('timeId', testedId)
            $('.main-content').data('schedule', startTime)
            // console.log(testRe,exRe);
            // console.log(typeId);
        } else {
            //当前试卷已提交过，统计过分数，不能再作答，不能再更改任何信息
            // 提示+跳转
            alert('当前考试已结束，即将查看考试解析')
            location.href = `answers.html?info=${already.data._id}`
            // location.href = `tests-end.html?info=${already.data._id}`
        }
        setTimeout(function () {
            clearInterval(Loading.timer)
            $('#loading-mask').fadeOut(200)
        }, 600)
    }else{
        if (confirm('请先登录！')) {
            location.href = `login.html`
        }else {
            location.href = `index.html`
        }
    }

})

function renderAnswerCard(testInfo) {
    // 单选题框,筛选试题type0
    // let $ne
    // let single, multi = 0;
    $('.tag-box').html('')
    $('.exercise-box').html('')
    testInfo.sort((a, b) => a.type - b.type)
    testInfo.forEach((info) => {
        if (info.type == 0) {
            // 单选
            single.push(info)
            createQuestion(info, 'single', single.length, stuAns[info._id])
        } else {
            multi.push(info)
            createQuestion(info, 'multi', multi.length, stuAns[info._id])
        }
    })
    // console.log(single, multi);
    // singleAnsArr = new Map(single.length).fill([])
    // multiAnsArr = new Map(multi.length).fill([])
}
//答题卡
// 按照考题顺序生成左侧部分的答题卡。
// 每个卡片有 2 个状态：已答和未答。默认状态 未答。
// 当学员进行答题之后，应该同步答题卡的卡片状态，同时保存学员的答案

// 考题右侧提供了一个收藏按钮，学员可以实时收藏考题，以便于复习。
// 当针对某个考题收藏之后，与之对应的试题卡片下方，应该有一个收藏的小红心

function createQuestion(info, name, index, ans) {
    let type = 'radio'
    if (name == 'multi') {
        // 显示多选分类
        $('.multi').css('display', 'block');
        type = 'checkbox'
        // $('main-content .multi').css('display', 'block');
    }
    // index表示当前是单选、多选中的第几题，单选多选分开计数
    // 新建答题卡标签
    let $newTab = $(` 
                        <div class="tag ${name}-${index}">
                            <div class="ans todo">${index}</div>
                            <div class="collect"></div>
                        </div>`)
    // 新建问题

    let $newQues = $(` 
        <div class="exercise" id="${name}-${index}" data-id = ${info._id}>
            <div class="collect"><span></span>收藏</div>
            <div class="question-part" data-question="${index}">
                <div class="title">
                    <pre disabled>${info.topics}</pre>
                </div>
                <ul class="choice-list">
                    <li>
                        <input type=${type} name="${name}-${index}" value='0' id="${name}-${index}-a">
                        <label for="${name}-${index}-a">A. ${info.options[0]}</label>
                    </li>
                    <li>
                        <input type=${type} name="${name}-${index}" value='1' id="${name}-${index}-b">
                        <label for="${name}-${index}-b">B. ${info.options[1]}</label>
                    </li>
                    <li>
                        <input type=${type} name="${name}-${index}" value='2' id="${name}-${index}-c">
                        <label for="${name}-${index}-c">C. ${info.options[2]}</label>
                    </li>
                    <li>
                        <input type=${type} name="${name}-${index}" value='3' id="${name}-${index}-d">
                        <label for="${name}-${index}-d">D. ${info.options[3]}</label>
                    </li>
                </ul>
            </div>
        </div>`)
    // name表示当前是多选还是单选
    $(`.ques-part.${name} .tag-box`).append($newTab)
    $(`.main-content .${name} .exercise-box`).append($newQues)
    $newQues.data('scroll', $newQues.offset().top)
    // console.log($newQues,$newQues.offset().top);
    if (ans != undefined) {
        // 此题有答案，直接修改input
        ans.forEach(i => {
            $newQues.find(`.choice-list li:nth-child(${i+1}) input`).prop('checked', true)
            $newTab.find('.ans').attr('class', 'ans done')
        })
    }
}

// 添加监听事件
// 答题卡界面，点击，跳转到对应习题.single-1 或者 .multi-2
// let scroll = 0;
$('.tag-box').on('click', '.tag', function (e) {
    // 获取当前习题的跳转目标
    let target = $(this).attr('class').split(' ')[1];
    // console.log(target);
    // console.log($(`#${target}`).offset().top);
    let scroll = $(`#${target}`).data('scroll')
    // console.log(scroll);
    // FIXME 第二次点击回到0，因为基于当前窗口的高度
    $('.main-content').animate({
        scrollTop: scroll - 150
    }, 300)
})
// 选择答案，切换样式
$('.exercise-box').on('click', '.collect,li input', function (e) {
    // console.log($(this));
    if ($(this).hasClass('collect')) {
        fnCollect.apply($(this))
    } else {
        fnAnswer.apply($(this))
    }
})

async function fnCollect() {
    let id = $(this).parents('.exercise').data('id')
    let queNum = $(this).parents('.exercise').attr('id')
    // console.log(queNum);
    // 修改对应tag的样式
    $(`.tag.${queNum} .collect`).toggleClass('active')
    // 点击收藏，切换五角星样式
    $(this).toggleClass('active')
    // 直接增加到收藏夹
    // console.log(id);
    let exId;
    if ($(this).hasClass('active')) {
        // 新增
        // console.log('add');
        exId = await getAjax(`/collections/${id}/${stuId}`, 'post')
        $(this).data('collect', exId)
    } else {
        // 取消
        // console.log('cancel');
        let collectId = $(this).data('collect')
        let re = await getAjax(`/collections/${collectId}`, 'delete')
        console.log(re.mes);
    }
}

async function fnAnswer() {
    let id = $(this).parents('.exercise').data('id')
    // 点击input或者对应label
    // 修改答题卡的框
    // 没有任何答案被选中，恢复为todo样式
    // 获取当前input的name
    let type = $(this).attr('type')
    console.log(type);
    let target = $(this).attr('name')
    let index = Number(target.split('-')[1])
    // 增加,修改答题卡可样式
    $(`.tag.${target} .ans`).addClass('done').removeClass('todo')

    // 添加选择进答案数组
    if (type == 'radio') {
        // 单选题，直接覆盖答案
        stuAns[id] = [Number($(this).val())]
        // console.log(singleAnsArr);
        //答题进度+1，长度加，百分比
        // renderProgress(1)

    } else {
        // 多选，获取所有答案
        // console.log($(`input[name="${target}"]:checked`));
        let arr = []
        $(`input[name="${target}"]:checked`).each(function () {
            arr.push(Number($(this).val()))
        });
        stuAns[id] = arr
        // console.log(multiAnsArr[3]);
        // 答题进度+1
        // renderProgress(1)
    }
    // 取消选择,针对多选，为空，修改答题框样式，
    if ($(`input[name="${target}"]:checked`).length == 0) {
        $(`.tag.${target} .ans`).addClass('todo').removeClass('done')
        // //答题进度-1
        // renderProgress(-1)
    }
    // 储存答案进session
    console.log(stuAns);
    console.log('test!!!!!');
    let ansJSON = JSON.stringify(stuAns);
    sessionStorage.setItem('ans', ansJSON)
    renderProgress()
}

function renderProgress() {
    //fn=0,init; fn=1,+1 ; fn=-1,-1
    // 计算当前每道题所占的百分比
    let all = single.length + multi.length;
    // console.log(all);
    let radio = 100 / all
    // let cur = $('.progress-text').text().split('/')[0]
    //tag-box 有done标签的元素个数
    let cur = 0;
    console.log($('.tag-box .ans'));
    $('.tag-box .ans').each(function () {
        if ($(this).hasClass('done')) {
            cur++
        }
    })
    $('.progress-bar span').animate({
        width: `${cur*radio}px`
    });
    $('.progress-text').text(`${cur} / ${all}`)

}


// 获取打开考卷的时间，记录在后台数据库的durations
async function setTimer(startTime, endTime) {
    // startTime
    // 同一学生，同一张卷子只能考一次，那么试卷的testedId是唯一的，数据也是唯一的
    let info = {
        studentId: stuId,
        testId: testId,
        typeId: typeId,
        durations: `${startTime}|${endTime}`,
    };
    let re = await getAjaxAns(`/testeds`, 'post', info)
    let testedId = re.tested_id;
    // console.log(testedId);
    return testedId;
}


function renderTimer(end) {
    // console.log('test');
    timer = setInterval(() => {
        let duration = moment.duration(moment(end).diff(moment()))
        //渲染时间
        // console.log(duration.hours()==0);
        if (duration.hours() <= 0 && duration.minutes() <= 0 && duration.seconds() <= 0) {
            //将数据传输给后端
            // clearInterval(timer)
            $('.exam-time').text('00:00:00')
            submitTest()
        } else {
            $('.exam-time').text(`${duration.hours()}:${duration.minutes()}:${duration.seconds()}`)
        }
    }, 1000)
}


//提交检测
$('#submitBtn').on('click', function (e) {
    // clearInterval(timer)
    // 检测是否弹出提醒框
    console.log(moment.duration($('.exam-time').text()));

    $('.tag-box .ans').each(function (i) {
        if ($(this).hasClass('todo')) {
            $('#noticeModal').modal('show');
            return;
        } else if (i == $('.tag-box .ans').length - 1) {
            submitTest()
        }
    })
    // console.log('test?');

    // if (Array.some.apply(ans,(ans) => ans.hasClass('todo'))) {

    // }else{
    //     submitTest()
    // }
})

$('.confirmBtn').on('click', function (e) {
    // clearInterval(timer)
    submitTest()
    $('#noticeModal').modal('hide');
})
//答案存进数据库
async function submitTest() {
    clearInterval(timer)
    // let ans = singleAnsArr.concat(multiAnsArr)
    // console.log(multiAnsArr, singleAnsArr);
    // console.log(`开始时间${startTime}`);
    let startTime = $('.main-content').data('schedule')
    // let remain = moment.duration($('.exam-time').text());
    let duration = moment.duration(moment().diff(moment(startTime)))
    // console.log();
    let id = $('.main-content').data('timeId')
    // let hour = duration.hours().length >= 0 && duration.hours().length <= 9 ? `0${duration.hours()}` : duration.hours()
    // let minute = duration.minutes().length >= 0 && duration.minutes().length <= 9 ? `0${duration.minutes()}` : duration.minutes()
    // let second = duration.seconds().length >= 0 && duration.seconds().length <= 9 ? `0${duration.seconds()}` : duration.seconds()
    let hour = duration.hours() > 0 ? `${duration.hours()}小时` : ''
    let minute = `${duration.minutes()}分`
    let second = `${duration.seconds()}秒`
    // console.log(stuAns);
    let info = {
        _id: id,
        studentId: stuId,
        testId: testId,
        typeId: typeId,
        answers: stuAns,
        durations: hour + minute + second,
        exIds: {
            info: exGroupId
        }
        // durations: `${hour}:${minute}:${second}`,
    };
    // console.log(info.durations);
    let re = await getAjaxAns(`/testeds/calc`, 'post', info)
    // 删除session数据
    sessionStorage.removeItem('stuAns')
    alert('考试结束，即将查看考试得分')
    location.href = `tests-end.html?id=${re.tested_id}`
}


function getAjaxAns(url, type, data) {
    console.log(url, type, data);
    let ansJSON = JSON.stringify(data)
    return $.ajax({
        url,
        type,
        data: {
            info: ansJSON
        }
    })
}

function getAjax(url, type) {
    return $.ajax({
        url,
        type
    })
}