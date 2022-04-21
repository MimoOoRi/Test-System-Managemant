//引入第三方资源，地址基于node_module
require('jquery/dist/jquery.min')
require('bootstrap/dist/css/bootstrap.min.css')
require('bootstrap/dist/js/bootstrap.min.js')
require('../css/reg.css')
require('../css/modal.css')

let isSame = false;
// 防抖判断两次密码是否一致

// console.log($('input.register'));
$('input.register').on('input focus', function (e) {
    let timer = null;
    return function (e) {
        if (e.type == 'focus') {
            $('.input-box').removeClass('active')
            // console.log($(this));
            $(this).parents('.input-box').addClass('active');
        }
        if (timer != null) {
            // 重置定时器
            clearTimeout(timer)
        }
        timer = setTimeout(function () {
            // 延时后，执行对应判断
            checkInput(e)
            timer = null;
        }, 750)
    }
}())

// 检查输出
function checkInput(e) {
    // 当前被聚焦input的name
    let name = $(e.target).attr('name');

    let psw = $('#password input').val()
    let con = $('#confirmed input').val()
    let checkTel = checkReg(/^1[3-9]\d{9}$/);
    let checkPassword = checkReg(/^[A-Z][a-zA-Z0-9]{5,15}$/);
    // 柯里化，检查密码和用户名
    if (name == 'account') {
        checkTel($('#account'))
    } else {
        checkPassword($('#password'))
        // 判断密码和确认密码内容是否一致
        if (con == psw && con != '' && psw != '') {
            // 输出一致，修改边框样式和提示信息
            // console.log('两次密码输出一致');
            // console.log($('.input-box[type="password"]'));
            $('.input-box input[type="password"]').css('border-color', 'green')
            $('span.label').css('color', 'green');
            $('#password .notice').text('')
            $('#confirmed .notice').text('')
            isSame = true;
        } else {
            // console.log('不一致');
            isSame = false;
            if (con != '' && psw != '') {
                $('#confirmed input').css('border-color', 'red');
                $('#confirmed span.label').css('color', 'red');
                $('#confirmed .notice').text('两次密码输入不一致').css('color', 'red')
            }
        }
    }
}

function checkReg(reg) {
    return function ($ele) {
        let $input = $ele.find('input')
        let str = $input.val()
        let $notice = $ele.find('.notice')
        if (reg.test(str)) {
            // 格式正确
            $input.css('border-color', 'green')
            $ele.find('span').css('color', 'green');
            $notice.text('')
        } else {
            $input.css('border-color', 'red')
            if ($input.attr('name') == 'account') {
                $notice.text('请输入正确的手机号')
                $ele.find('span').css('color', 'red')
            } else {
                $notice.text('大写字母开头的6-16位数字')
                $ele.find('span').css('color', 'red')
            }
        }
        // 判空，为空的时候，清除notice
        // if (str == '') {
        //     $notice.text('')
        //     $input.css('border-color', '#6966eb')
        //     $ele.find('span').css('color', '#6966eb')
        // }
        // return 
    }
}

// 点击登录按钮，传输
$('.login-btn').on('click', function (e) {
    if (isSame) {
        // 获取input框中的信息account、password
        let inputs = $(this).parents('form').find('input.register')
        $.ajax({
            url: `/students/register`,
            type: 'post', 
            data:{
                phone:inputs.eq(0).val(),
                password: inputs.eq(1).val(),
            },
            success: function (data) {
                // 如果返回到token，储存到session，
                if (data.code == 1) {
                    // console.log(data.data);
                    // sessionStorage.setItem('token', data.data)
                    alert(data.mes)
                    // 登录成功后，跳转到首页
                    location.href = 'login.html'
                } else {
                    alert(data.mes)
                    // 重置input框信息
                    $('#registerForm')[0].reset()
                }
            }
        })
    }
})