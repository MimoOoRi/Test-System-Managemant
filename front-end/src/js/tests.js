//引入第三方资源，地址基于node_module
import 'jquery/dist/jquery.min'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'
import '../css/header-footer.css'
import '../css/tests.css'
import '../css/modal.css'
// import './index.js'

let type = Number($('#typeSelector').val());
$(async function () {
    $('.score').val('3')
    //从数据库获取信息
    let getRe = await getAjax(`/points`, 'get')
    let points = getRe.data
    // 从数据库获取试卷信息
    let testRe = await getAjax(`/tests`, 'get')
    let tests = testRe.data
    console.log(tests);
    // console.log(points);
    renderTest(tests)
    renderPoint(points)
})

function renderPoint(points) {
    points.forEach((point, i) => {
        // let $newOption =
        //     $(`
        //     <div>
        //         <input type="checkbox" name="points" id=${point._id}>
        //         <label for="${point._id}">${point.knowledge}</label>
        //     </div>
        // `)
        let $newOption =
            $(`
            <option value="${point._id}">${point.knowledge}</option>
        `)
        $('#points').append($newOption)
    })
}

function renderTest(tests) {
    tests.forEach((test, i) => {
        let $newOption =
            $(`
            <div>
                <input type="checkbox" name="tests" id=${test._id}>
                <label for="${test._id}">${test.title}</label>
            </div>
        `)
        $('#tests').append($newOption)
    })
}
// console.log(type);
$('select').change(function () {
    type = Number($('#typeSelector').val());
    if (type == 1) {
        $('input.type').prop('type', 'checkbox');
        $('.score').val('5')
    } else {
        $('input.type').prop('type', 'radio');
        $('.score').val('3')
    }
})

let exercise = {}
$('.submit').on('click', async function () {
    let answer = []
    let checked = $('#options input:checked')
    // console.log(checked);
    checked.each(function () {
        answer.push(Number($(this).val()))
    })
    // console.log(answer);
    let topics = $('.topics').val()
    let options = [];
    $('input.option-text').each(function () {
        options.push($(this).val())
    })
    let analysis = $('.analysis').val()
    let score = Number($('input.score').val())
    
    //绑定知识点
    let pointId = $('#points').val()
    // $('#points').val()
    // $('input[name="points"]:checked').each(function () {
    //     // options.push($(this).attr('value'))
    //     // console.log($(this).next().val());
    //     // console.log($(this).attr('id'));
    //     pointId.push($(this).attr('id'))
    // })
    //绑定试卷
    let tests = []
    $('input[name="tests"]:checked').each(function () {
        // options.push($(this).attr('value'))
        // console.log($(this).next().val());
        // console.log($(this).attr('id'));
        tests.push($(this).attr('id'))
    })

    // 储存所有信息到JSON
    exercise = {
        type,
        topics,
        options,
        answer,
        analysis,
        score,
        pointId,
    }
    console.log(exercise);
    let re = await sendAjax(`/exercises/submit`, 'post', exercise)
    console.log(re);

    //将返回的习题id传给添加进目标试卷
    let exIds = re.data._id
    console.log(tests,exIds);
    console.log(exIds);
    let exInfo = {
        exIds,
        tests
    }
    let addExsRe = await getAjax(`/tests/addExs/${JSON.stringify(exInfo)}`,'patch')
    console.log(addExsRe);
    $('form')[0].reset()
})


function sendAjax(url, type, data) {
    console.log(data);
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