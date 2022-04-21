//引入第三方资源，地址基于node_module
import 'jquery/dist/jquery.min'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'
import '../css/header-footer.css'
import '../css/answers.css'
import '../css/modal.css'
import moment from "moment";
import * as Util from './util'
import * as Token from './analyzeToken'
import * as Loading from './loading'

// 获取试卷信息
let expired = location.search.split('&')[1]||null
let testedId = location.search.split('&')[0].split('=')[1]
let single = []
let multi = []
let stuId;
$(async function () {
    // 显示loading页面
    $('#loading-mask').fadeIn(10)
    console.log(testedId);
    let user = await Token.init()
    if (user) {
        if(expired!=null){
            // 已超时，需要修改数据库数据
            let exRE = await getAjax(`/testeds/${testedId}`, 'patch')
            console.log(exRE);
        }
        // 获取对应学生id，试卷id，考试成绩、考试时长
        let re = await getAjax(`/testeds/${testedId}`, 'get')
        stuId = re.stuInfo._id
        let testInfo = re.testEnd
        let stuAns = testInfo.answers
        // console.log(testInfo);
        let testRe = await getAjax(`/exercises/analysis/${testInfo.testId}`, 'get')
        let exGroup = testRe.data.exerciseId
        // console.log(exGroup);
        // 渲染右侧信息展示栏
        renderExamInfo(testInfo)
        renderAnswerCard(exGroup, stuAns)
        setTimeout(function() {
            clearInterval(Loading.timer)
            $('#loading-mask').fadeOut(200)
        },200)
    }else{
        if (confirm('请先登录！')) {
            location.href = `login.html`
        }else {
            location.href = `index.html`
        }
    }
})


function renderExamInfo(info) {
    // 修改考试成绩、时长
    $('.exam-score').text(info.score)
    $('.exam-time').text(info.durations)
}

function renderAnswerCard(testInfo, stuAns) {
    console.log(stuAns);
    if(stuAns.length==0){
        stuAns = new Array(testInfo.length).fill([]);
    }
    // 单选题框,筛选试题type0
    // let $ne
    // let single, multi = 0;
    $('.tag-box').html('')
    $('.exercise-box').html('')
    testInfo.forEach((info, i) => {
        // console.log(info.type);
        if (info.type == 0) {
            // 单选 
            single.push(info)
            createQuestion(info, 'single', single.length, stuAns[i])
        } else {
            multi.push(info)
            createQuestion(info, 'multi', multi.length, stuAns[i])
        }
    })
    // console.log(single, multi);
    // singleAnsArr = new Map(single.length).fill([])
    // multiAnsArr = new Map(multi.length).fill([])
}

function createQuestion(info, name, index, stuAns) {
    let state = []
    let type = 'radio'
    if (name == 'multi') {
        // 显示多选分类
        $('.multi').css('display', 'block');
        type = 'checkbox'
        // $('main-content .multi').css('display', 'block');
    }
    // console.log(stuAns);

    // 判断正误 练习题id info._id
    // 试题答案通过info获取，学生答案从ajax后端获取， 学生答案的顺序此时==正确答案顺序
    // console.log(stuAns,info.answer);
    let ans = info.answer.sort();
    if (stuAns!=undefined&&(stuAns.join('') == ans.join(''))) {
        state = ['correct', '答对了'];
    } else {
        state = ['wrong', '答错了']
    }

    // index表示当前是单选、多选中的第几题，单选多选分开计数
    // 新建答题卡标签
    let $newTab = $(` 
    <div class="tag ${name}-${index}">
        <div class="ans ${state[0]}">${index}</div>
        <div class="collect"></div>
    </div>`)

    // 新建问题

    let $newQues = $(` 
        <div class="exercise" id="${name}-${index}" data-id = ${info._id}>
            <div class="collect"><span></span>收藏</div>
            <div class="question-part" data-question="${index}">
                <div class="title">
                    <pre>${info.topics}</pre>
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
            <div class="answer-part" data-question="${index}">
            </div>
        </div>`)

    // name表示当前是多选还是单选
    $(`.ques-part.${name} .tag-box`).append($newTab)
    $(`.main-content .${name} .exercise-box`).append($newQues)

    //根据考生答案，为input设定选中状态和样式
    let character = ['A', 'B', 'C', 'D']
    let stuChar = [...stuAns].map(i => {
        $newQues.find(`.choice-list li:nth-child(${i+1})`).addClass('active').find(`input`).prop('checked', true)
        return character[i]
    });
    let ansChar = [...ans].map(i => character[i])
    //根据考生答案，为input设定选中状态和样式
    // $newQues.find(`.choice-list li:nth-child(${}) input`).
    let $newAnalysis =
        $(`<p class="ans ${state[0]}">${state[1]}</p>
        <p>考生答案：<span class="answer ${state[0]}">${stuChar}</span></p>
        <p>正确答案：<span class="correct">${ansChar}</span></p>
        <p>答案解析：<span class="analysis"><pre>${info.analysis}</pre></span></p>`)
    $newQues.find('.answer-part').html('').append($newAnalysis)

}

// 添加监听事件
// 答题卡界面，点击，跳转到对应习题.single-1 或者 .multi-2
$('.tag-box').on('click', '.tag', function (e) {
    // 获取当前习题的跳转目标
    let target = $(this).attr('class').split(' ')[1];
    // console.log(target);
    // console.log($(`#${target}`).offset().top);
    // FIXME 第二次点击回到0，因为基于当前窗口的高度
    $('.main-content').animate({
        scrollTop: $(`#${target}`).position().top - 150
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

async function fnAnswer() {
    let id = $(this).parents('.exercise').data('id')
    console.log(id);
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
    renderProgress()
}
// 选择答案，切换样式
$('button.theme-btn').on('click', function (e) {
    // console.log($(this));
    location.href = `index.html?main=tests`
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

function getAjax(url, type) {
    return $.ajax({
        url,
        type
    })
}