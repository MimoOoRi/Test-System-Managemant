//引入第三方资源，地址基于node_module
require('jquery/dist/jquery.min')
require('bootstrap/dist/css/bootstrap.min.css')
require('bootstrap/dist/js/bootstrap.min.js')
require('../css/tests-basic-info.css')
require('../css/modal.css')
import moment from "moment";
import * as Util from './util'
import * as Loading from './loading'
import './analyzeToken'


let testId = location.search.substring(1).split('&')[0].split('=')[1]
// 获取学生id
let stuId = location.search.substring(1).split('&')[1].split('=')[1]
let typeId = location.search.substring(1).split('&')[2].split('=')[1]
$(function () {
    // 显示loading页面
    $('#loading-mask').fadeIn(10)
    // 获取search的testId信息
    // console.log(testId,stuId);
    $.ajax({
        url: `/tests/${testId}/${stuId}/${typeId}`,
        type: 'POST',
        success: function (data) {
            console.log(data);
            renderTestInfo(data.data, data.info);
            setTimeout(function() {
                clearInterval(Loading.timer)
                $('#loading-mask').fadeOut(200)
            },600)
        }
    })
});

function renderTestInfo(info, test) {
    // console.log(Util.getTestSchedule);
    let schedule = Util.getTestSchedule(test);
    let $newInfo =
        $(`<h2 class="title">${info[0]}</h2>
    <div class="test-info">
        <!-- <span class="sub-title">试卷信息</span> -->
        <p>考试类型：<span>${info[1]}</span></p>
        <p>考试时间：<span>${schedule}</span></p>
        <p>答卷时间：<span>${info[2]}</span></p>
        <p>考试方式：<span>线上</span></p>
    </div>
    <div class="stu-info">
        <!-- <span class="sub-title">考生信息</span> -->
        <p>姓名：<span>${info[3]}</span></p>
        <p>证件号码：<span>129387510238418741023985</span></p>
    </div>`)
    $('.btn-box').before($newInfo)
}

$('.btn-box').on('click', 'button', function (e) {
    if($(this).hasClass('back')){
        // 返回上一步,即试题页面
        history.back();
    }else{
        // 进入考试页面
        location.href = `exercises.html?test=${testId}&stu=${stuId}&type=${typeId}`;
        // location.href = `exercises.html?test=625634c71a34000097001cc7&stu=6257cfdc86104b27f3229fb8&type=625633891a34000097001cc5`;
    }
})
