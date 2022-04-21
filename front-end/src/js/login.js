//引入第三方资源，地址基于node_module
require('jquery/dist/jquery.min')
require('bootstrap/dist/css/bootstrap.min.css')
require('bootstrap/dist/js/bootstrap.min.js')
require('../css/login.css')

// 点击登录按钮，传输
$('.login-btn').on('click', function(e) {
    // 获取input框中的信息account、password
    let inputs = $(this).parents('form').find('input.login')
    // console.log(inputs.eq(0).val());
    $.ajax({
        url:`/students/login`,
        type: 'post', 
        data:{
            phone:inputs.eq(0).val(),
            password:inputs.eq(1).val()
        },
        success: function(data) {
            console.log(data);
            // 如果返回到token，储存到session，
            if(data.data){
                // console.log(data.data);
                sessionStorage.setItem('token', data.data)
                // alert(data.mes)
                // 登录成功后，跳转到首页
                location.href='index.html'
            }else{
                alert(data.mes)
                // 重置input框信息
                $('#loginForm')[0].reset()
            }
        }
    })
    
})