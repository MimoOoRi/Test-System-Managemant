//引入第三方资源，地址基于node_module
require('jquery/dist/jquery.min')
require('bootstrap/dist/css/bootstrap.min.css')
require('bootstrap/dist/js/bootstrap.min.js')
import '../css/header-footer.css'
require('../css/errors.css')
require('../css/modal.css')
import moment from "moment";
import * as Util from './util'
import * as Token from './analyzeToken'
import * as Loading from './loading'

//先检测是否登录，检查是否有token传回来
let curEx = 0;
let exGroup = []
let stuId;
let single = 0
let multi = 0;
// let stuId = '6257cfdc86104b27f3229fb8';
// 并根据 students._id 从 errors 集合中获取当前学员的错题集合
$(async function () {
    // console.log(moment().millisecond());
    // 显示loading页面
    $('#loading-mask').fadeIn(10)
    let user = await Token.init()
    // 从token中解析信息，获取id
    if (user) { 
        stuId = user._id
        // 渲染title
        $('h3').text('错题本')
        // 获取错题本列表
        let re = await getAjax(`/errors/${stuId}`, 'get')
        exGroup = re.data;
        // console.log(re);
        // console.log(moment().millisecond());
        if (exGroup.length==0) {
            if (confirm('当前收藏夹为空,即将回到首页')) {
                location.href = 'index.html'
            }
        } else {
            // console.log(exGroup);
            // 渲染左侧答题卡
            renderAnswerCard()
            //渲染第一道题
            createQuestion(curEx, 1)
            // 渲染右侧工具栏
            renderProgress()
            clearInterval(Loading.timer)
            $('#loading-mask').css('display', 'none')
            // setTimeout(function() {
            //     clearInterval(Loading.timer)
            //     $('#loading-mask').fadeOut(200)
            // },1000)
        }
    }else{
        if (confirm('请先登录！')) {
            location.href = `login.html`
        }else {
            location.href = `index.html`
        }
    }
})

function renderAnswerCard() {
    // 单选题框,筛选试题type0 
    single = 0;
    multi = 0
    $('.tag-box').html('')
    exGroup.sort((a, b) => a.type - b.type)
    exGroup.forEach((info, i) => {
        //     // 将单选插入到数组前
        // console.log(info.type);
        if (info.type == 0) {
            // 多选
            // single.push(info)
            single++;
            $('.single').css('display', 'block');
            info['target'] = `single-${i}`
            createTag(i, single)
        } else {
            // multi.push(info)
            multi++;
            $('.multi').css('display', 'block');
            info['target'] = `multi-${i}`
            createTag(i, multi)
        }
    })
}

function createTag(index, i) {
    //index 是主，i是副
    let name = exGroup[index].target.split('-')[0]
    // let index = info[i].target.split('-')[1]
    // 新建答题卡标签
    let $newTab = $(` 
    <div class="tag ${name}-${index}">
        <div class="ans ans-${i}"}">${i}</div>
    </div>`)
    $(`.ques-part.${name} .tag-box`).append($newTab)
    $newTab.on('click', function (e) {
        // 显示对应的题目
        createQuestion(index, i)
    })
}

function createQuestion(index, i) {
    // console.log(i);
    curEx = index;
    // console.log(exGroup, index);
    let info = exGroup[index]
    // console.log(info.type);
    let type = 'radio',
        name = 'single'
    if (info.type == 1) {
        // 显示多选分类
        type = 'checkbox'
        name = 'multi'
    }
    // 新建问题
    let $newQues = $(`  
            <div class="question-part" data-question="${index}" id="${name}-${index}" data-id = ${info._id}>
                <div class="title">${i}. 
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
    // $(`.main-content .exercise`).html('').append($newQues)
    if (!$('.question-part')) {
        $('.main-content .exercise').append($newQues)
    } else {
        $('.question-part').remove()
        $('.answer-part').remove()
        $('.main-content .exercise').append($newQues)
    }
    if (name == 'single') {
        // 选择答案，切换样式,显示解析
        $('.choice-list').on('click', 'li input', getAnalysis)
    }else{
        // 提示 点击下方空白，提供解析
        $('.answer-part').html(`<span>点击横线下方空白区域，显示多选答案</span>`)
        $('.answer-part').on('click', getAnalysis)
    }
    if (exGroup[index].analysis) {
        // 已经答过题，不能再重复选择，除非重新开始
        $('.exercise input').prop('disabled', true)
        let {
            state,
            content,
            ansChar,
            stuChar
        } = exGroup[index].analysis
        let $newAnalysis =
            $(`<p class="ans ${state[0]}">${state[1]}</p>
        <p>考生答案：<span class="answer ${state[0]}">${stuChar}</span></p>
        <p>正确答案：<span class="correct">${ansChar}</span></p>
        <p>答案解析：<span class="analysis"><pre>${content}</pre></span></p>`)
        //如果没有选择答案，考生答案框隐藏
        $('.answer-part').html('').append($newAnalysis)
        if (stuChar == '') {
            $('.answer-part p:nth-child(-n+2)').css('display', 'none')
        } else {
            stuChar.forEach((ans) => {
                let i = 'ABCD'.indexOf(ans) + 1
                $(`.choice-list li:nth-child(${i})`).addClass('active')
                $(`.choice-list li:nth-child(${i}) input`).prop({
                    'checked': true,
                    'disabled': true
                })
            })
        }
    }
}


async function getAnalysis() {
    $('.exercise input').prop('disabled', true)
    // console.log('here!');
    //获取当前考生的选择
    let i = $('.question-part').data('question')
    let errorId = exGroup[i]._id
    // 判断正误 
    let re = await getAjax(`/errors/analysis/${errorId}`, 'get')
    createAnalysis(re)
}

function createAnalysis(data) {
    let info = data.data
    let standAns = info.answer.sort();
    let ansStr = standAns.join('');
    let state = ['wrong', '答错了']
    let stuAns = []
    // 修改样式需要获取index
    let target = $('.question-part').attr('id')
    let index = $('.question-part').attr('id').split('-')[1]
    // console.log(ansStr);
    // 首先判断是否有答案
    let choice = $(`.choice-list input:checked`)
    $(`.choice-list input:checked`).parents('li').addClass('active')
    // 获取解析，默认样式为wrong
    $(`.tag.${target} .ans`).attr('class', 'ans wrong')
    if (choice.length > 0) {
        // 有答案
        stuAns = getAnswer()
        // console.log(ans,ansStr);
        // 比较答案
        if (stuAns == ansStr) {
            // 答案正确
            // 修改答题卡样式、修改state
            state = ['correct', '答对了'];
            $(`.tag.${target} .ans`).attr('class', 'ans correct')
        }
    }
    //显示解析
    // //根据考生答案，为input设定选中状态和样式
    let character = ['A', 'B', 'C', 'D']
    let stuChar = [...stuAns].map(i => character[i])
    let ansChar = standAns.map(i => character[i])
    //根据考生答案，为input设定选中状态和样式
    // $newQues.find(`.choice-list li:nth-child(${}) input`).
    let $newAnalysis =
        $(`<p class="ans ${state[0]}">${state[1]}</p>
        <p>考生答案：<span class="answer ${state[0]}">${stuChar}</span></p>
        <p>正确答案：<span class="correct">${ansChar}</span></p>
        <p>答案解析：<span class="analysis"><pre>${info.analysis}</pre></span></p>`)
    //如果没有选择答案，考生答案框隐藏
    $('.answer-part').html('').append($newAnalysis)
    if (stuChar == '') {
        $('.answer-part p:nth-child(-n+2)').css('display', 'none')
    } else {
        $('.answer-part p:nth-child(-n+2)').css('display', 'block')
    }

    //当前解析已获取，回到之前的解析，解析还在，需要将解析传入exGroup数组
    exGroup[index]['analysis'] = {
        content: info.analysis,
        state,
        stuChar,
        ansChar
    }
    // // 取消选择,针对多选，为空，修改答题框样式，
    // if (stuChar=='') {
    //     $(`.tag.${target} .ans`).addClass('todo').removeClass('done')
    //     // //答题进度-1
    //     // renderProgress(-1)
    // }
    renderProgress()
}

$('.changeExercise').on('click', 'span', function (e) {
    let i = Number($(`.question-part .title`).text().match(/^.+(?=\.)/))
    if ($(this).hasClass('nextBtn')) {
        // 切换下一题
        if (curEx + 1 >= exGroup.length) {
            console.log('没有下一题');
        } else {
            // console.log(single, multi);
            if (exGroup[curEx].type != exGroup[curEx + 1].type) {
                // 当前是多选
                i = 0
            }
            curEx++;
            // createInfo(curEx)
            // 获取当前的i
            // console.log(curEx);
            createQuestion(curEx, i + 1)
        }
    } else {
        // if($(this))
        // 获取当前习题的题号，即第几题
        if (curEx - 1 < 0) {
            console.log('没有上一题');
        } else {
            if (exGroup[curEx].type != exGroup[curEx - 1].type) {
                // 当前是多选
                i = single+1
            }
            curEx--;
            createQuestion(curEx, i - 1)
        }
    }
})
$('.analysis-box').on('click', 'span', async function (e) {
    // console.log($(this));
    if ($(this).hasClass('showAnalysis')) {
        // 显示解析
        getAnalysis()

    } else {
        // 从数据库删除本错题 
        let i = $(`.question-part .title`).text().match(/^.+(?=\.)/)
        // console.log(i);
        // 从当前数组删除本错题，重新渲染下一道题
        // tag答题卡需要删除 
        // console.log(curEx);
        exGroup.splice(curEx, 1)
        // console.log(exGroup.length);
        // 应该直接渲染i的下一道题
        // $(`.question-part`).attr('id')   //single-0   type-(i-1)
        let type = $(`.question-part`).attr('id').split('-')[0];
        renderAnswerCard()
        if (type == 'multi') {
            if (curEx == multi) {
                // 删除的是最后一个元素,显示上一个
                createQuestion(curEx, i - 1)
            } else {
                // 正常，序号显示当前
                createQuestion(curEx, i)
            }
            multi--
        } else {
            if (curEx == single) {
                // 删除的是最后一个元素,显示上一个
                createQuestion(curEx, i - 1)
            } else {
                // 正常，序号显示当前
                createQuestion(curEx, i)
            }
            single--
        }

        renderProgress()
    }
})
$('.restart').on('click', function (e) {
    createQuestion(0, 1)
})

function renderProgress() {
    //fn=0,init; fn=1,+1 ; fn=-1,-1
    // 计算当前每道题所占的百分比
    let all = exGroup.length;
    // console.log(all);
    let radio = 100 / all
    // let cur = $('.progress-text').text().split('/')[0]
    //tag-box 有done标签的元素个数
    let cur = 0;
    // console.log($('.tag-box .ans'));
    $('.tag-box .ans').each(function () {
        if ($(this).hasClass('correct') || $(this).hasClass('wrong')) {
            cur++
        }
    })
    $('.progress-bar span').animate({
        width: `${cur*radio}px`
    });
    $('.progress-text').text(`${cur} / ${all}`)

}

function getAnswer() {
    // 获取答应的answers，转化成字符串，修改样式，返回
    let inputs = $('.exercise input:checked');
    let stuAns = ''
    // 已选择，需要对答案进行判断
    inputs.each(function (i) {
        stuAns += $(this).val()
    })
    // console.log(stuAns);
    return stuAns;
}

function getAjax(url, type) {
    return $.ajax({
        url,
        type
    })
}