//引入第三方资源，地址基于node_module
require('jquery/dist/jquery.min')
require('bootstrap/dist/css/bootstrap.min.css')
require('bootstrap/dist/js/bootstrap.min.js')
require('../css/tests-end.css')
import * as Util from './util'
import * as Loading from './loading'

// 获取试卷信息
let testedId = location.search.split('=')[1]
$(async function() {
    // 显示loading页面
    $('#loading-mask').fadeIn(10)
    $('.info-box').html('')
    console.log(testedId);
    let re =await Util.getAjax(`/testeds/${testedId}`,'get')
    let stu = re.stuInfo
    let testInfo = re.testEnd
    console.log(testInfo);
    let $newInfo = 
    $(`<img src="/${stu.avatar.split('//')[1]}" alt="">
    <p class="stu-name">${stu.name}</p>
    <div class="score-info">
        <div>
            <span class="info deco-star">${testInfo.score}</span>
            <span>分</span>
        </div>
        <p>考试已结束，感谢作答！</p>
    </div>
    <div class="other-info">
        <div class="accurate">
            <span class="info">${testInfo.accuracy}</span>
            <span>正确率</span>
        </div>
        <div class="time">
            <span class="info">${testInfo.durations}</span>
            <span>答题用时</span>
        </div>
    </div>
    <div class="btn-box">
        <button class="theme-btn">查看解析</button>
    </div>`)
    $('.info-box').append($newInfo)
    $('button.theme-btn').on('click', function (e) {
        // 跳转到解析页面
        location.href = `answers.html?first-info=${testedId}`
    })
    setTimeout(function() {
        clearInterval(Loading.timer)
        $('#loading-mask').fadeOut(200)
    },600)
})
