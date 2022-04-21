//引入第三方资源，地址基于node_module
import 'jquery/dist/jquery.min'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'
import '../css/header-footer.css'
import '../css/collections.css'
import '../css/modal.css'
import moment from "moment";
import * as Util from './util'
import * as Token from './analyzeToken'
import * as Loading from './loading'

//先检测是否登录，检查是否有token传回来
// let single = []
// let multi = []
let single = 0
let multi = 0
let coGroup = []
let stuId;
$(async function () {
    // 显示loading页面
    $('#loading-mask').fadeIn(10)
    let user = await Token.init();
    if (user) { 
        stuId = user._id
        // 渲染title
        $('h3').text('习题收藏夹')
        // 获取错题本列表
        let re = await getAjaxData(`/collections/render`, 'get', {
            stuId
        })
        // console.log(re);
        coGroup = re.data;
        // console.log(coGroup);
        if (coGroup.length == 0) {
            if (confirm('当前收藏夹为空,即将回到首页')) {
                location.href = 'index.html'
            }
        } else {
            // console.log(coGroup);
            coGroup.sort((a, b) => a.exerciseId.type - b.exerciseId.type)
            //习题分类，单选、多选
            coGroup.forEach((co, i) => {
                if (co.exerciseId.type == 0) {
                    // 单选
                    single++;
                    // single.push(co.exerciseId)
                    $('.single').css('display', 'block');
                    //渲染题目
                    createTag(i, single, 'single')
                    renderQuestions(i, single)
                } else {
                    multi++;
                    // multi.push(co.exerciseId)
                    $('.multi').css('display', 'block');
                    //渲染题目
                    createTag(i, multi, 'multi')
                    renderQuestions(i, multi)
                }
            })
            // 渲染左侧答题卡
            // renderAnswerCard()
            clearInterval(Loading.timer)
            $('#loading-mask').fadeOut(200)
            // setTimeout(function () {
            // }, 300)
        }

    }else{
        if (confirm('请先登录！')) {
            location.href = `login.html`
        }else {
            location.href = `index.html`
        }
    }
})

function createTag(index, i, name) {
    // 新建答题卡标签
    let $newTab = $(` 
    <div class="tag ${name}-${i}">
        <div class="ans correct ">${i}</div>
    </div>`)
    $(`.ques-part.${name} .tag-box`).append($newTab)
    $newTab.on('click', function (e) {
        // 获取当前习题的跳转目标
        let target = $(this).attr('class').split(' ')[1];
        console.log(target);
        // console.log($(`#${target}`).offset().top);
        // FIXME 第二次点击回到0，因为基于当前窗口的高度
        // $('html,body').animate({
        //     // console.log($(`#${target}`).top);
        //     scrollTop: $(`#${target}`).offset().top-150
        // }, 300)
        let scroll = $(`.exercise.${target}`).data('scroll') - 150
        // console.log(scroll);
        // FIXME 第二次点击回到0，因为基于当前窗口的高度
        $('.main-content').animate({
            scrollTop: scroll
        }, 300)
    })
}

function renderQuestions(i, index) {
    // index 表示在类型题集中的下标
    let info = coGroup[i].exerciseId
    // console.log(info);
    let type = 'radio',
        name = 'single'
    if (info.type == 1) {
        // 显示多选分类
        type = 'checkbox'
        name = 'multi'
    }
    // 新建问题
    let $newQues = $(`  
        <div class="exercise ${name}-${index}">
            <div class="collect"><span></span>删除</div>
            <div class="question-part" data-question="${i}" id="${name}-${index}" data-id = ${info._id}>
                <div class="title">
                ${index}. 
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
    // console.log(coGroup[i]._id);
    $newQues.find('.collect').data('collect', coGroup[i]._id)
    // console.log($newQues.find('.collect').data('collect'));
    // name表示当前是多选还是单选
    $(`.main-content .${name} .exercise-box`).append($newQues)
    // 储存当前位置
    $newQues.data('scroll', $newQues.offset().top)
    console.log($newQues, $newQues.data('scroll'));
    // $('.main-content .exercise').append($newQues)
    let exInfo = coGroup[i].exerciseId;
    // console.log(exInfo);
    let ans = exInfo.answer;
    let character = ['A', 'B', 'C', 'D']
    let ansChar = ans.map(i => character[i])
    // console.log(ans);
    let $newAnalysis =
        $(`
        <p>正确答案：<span class="correct">${ansChar}</span></p>
        <p>答案解析：<span class="analysis"><pre>${exInfo.analysis}</pre></span></p>`)
    $newQues.find('.answer-part').append($newAnalysis)
    // //根据考生答案，为input设定选中状态和样式

    // console.log(ans);
    //修改input答案样式
    ans.forEach((a) => {
        // let i = 'ABCD'.indexOf(a) + 1
        // console.log(a+1);
        $newQues.find(`li:nth-child(${a+1})`).addClass('active')
        $newQues.find(`li:nth-child(${a+1}) input`).prop({
            'checked': true,
            'disabled': true
        })
    })

}

// 选择答案，切换样式
$('.exercise-box').on('click', '.collect', delCollect)

async function delCollect() {
    // console.log($(this));
    let $ques = $(this).next('.question-part')
    // 下标，为了快速查找
    let index = $ques.data('question')
    let Num = $ques.attr('id').split('-')[1]
    // 当前试题的位置，之后的题都需要修改
    let exIndex = $(this).parents('.exercise').index();
    let type = $ques.attr('id').split('-')[0]
    let collectId = $(this).data('collect')

    $(this).parents('.exercise').remove()
    $(`.tag.${type}-${Num}`).remove()
    // console.log(index);
    // let type = coGroup[index].exerciseId.type
    // let queNum = $(this).parents('.exercise').attr('id')
    let length = (type == 'single') ? (single) : (multi)
    // console.log(length);
    // console.log(type);
    // if()
    // console.log(queNum);
    coGroup.splice(index, 1)
    // // 重新渲染从index向后的元素
    for (let i = Num; i <= length; i++, exIndex++) {
        // console.log(i,length);
        // 只修改题号
        let $title = $(`#${type}-${i}`).find('.title');
        // console.log($title);
        $title.text(`${$title.text().replace(/^.+\./, `${exIndex}.`)}`)
        //修改tag内容
        $(`.tag.${type}-${i}`).find('.ans').text(exIndex)
    }
    // let exId;
    // // 取消
    // // console.log('cancel');
    // console.log($(this));
    // console.log(index);

    // let collectId = coGroup[index]._id
    // console.log(collectId);
    let re = await Util.getAjax(`/collections/${collectId}`, 'delete')
    console.log(re.mes);
}

async function getAjaxData(url, type, data) {
    return await $.ajax({
        url,
        type,
        data
    })
}

$('.theme-btn').on('click', function (e) {
    // 跳转到首页
    location.href = "index.html"
})