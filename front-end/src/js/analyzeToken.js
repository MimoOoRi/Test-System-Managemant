//引入第三方资源，地址基于node_module
require('jquery/dist/jquery.min')
require('../css/modal.css')

let token, id, userInfo, now;
$(window).on('load', async function (e) {


    // 获取当前session是否有token值，判断登录态
    token = sessionStorage.getItem('token')
    if (token) {
        // console.log(token);
        // 更改登录、注册框为用户信息展示框
        now = location.pathname.split('/')[2].split('.')[0]
        if (now == 'index') {
            now = location.search.split('main=')[1];
        }
        $(`.nav-ul li`).removeClass('active').parent().find(`li.${now}`).addClass('active')
        $('.login-register').css('display', 'none')
        $('.logged-box').css('display', 'flex')
        // 渲染用户信息 接口 renderPer
        let re = await $.ajax({
            url: '/students',
            type: 'get',
            headers: {
                Authorization: 'Bearer ' + token
            }
        })
        userInfo = re.data
        id = userInfo._id
        renderUserInfo(userInfo)
        getRank()
    }

    //无论是否登录，都渲染考试类型文字 types接口
    $.ajax({
        url: '/types/render',
        type: 'GET',
        success: function (data) {
            // 渲染考试文字
            // console.log(data);
            let spanGroup = $('.intro-list .display-card span')
            // console.log(data.data[0]['type']);
            spanGroup.each(i => spanGroup.eq(i).text(data.data[i]['type']))
        }
    })
})

function getStatistics() {
    // 动态渲染 用户数据统计信息
    $.ajax({
        url: '/students/renderData',
        type: 'POST',
        data: {
            _id: id
        },
        success: function (data) {
            // 渲染对应的数据
            renderStatistics(data)
        }
    })
}

// 渲染右上角用户信息
function renderUserInfo(user) {

    $('.userInfo span').text(user.name||`用户${user.phone}`);
    let url = '../' + user.avatar?.split('//')[1];
    $('.userInfo img').attr('src', url);
    $('.userInfo img').one('error', function (e) {
        let defaultUrl = '/images/avatar01.png'
        $('.userInfo img').attr('src', defaultUrl)
    })
}

// 点击图片修改图片信息
$('#picUploader').on('change', function (e) {
    //获取要上传的文件信息
    let file = e.target.files[0];
    // console.log(file);
    //上传文件类型和大小限制
    if (!file.type.startsWith('image') || file.size > 1024000) {
        alert('只能上传图片哦!并且文件不能大于1000KB!');
        return;
    }
    //将文件信息封装为form表单数据格式
    let formData = new FormData();
    formData.append('file', file);
    //将文件数据发送到服务器去
    $.ajax({
        url: '/students',
        type: 'post',
        data: formData,
        success: function (data) {
            // console.log(data);
            //预览新添加头像
            // console.log(data.data);
            $('.avatar-info img').attr('src', data.data)
        },
        //防止jquery自动转换提交数据格式
        contentType: false,
        processData: false,
        //上传数据不缓存
        cache: false
    });
})

// 先渲染已有用户信息
$('#changeInfoBtn').on('click', function (e) {
    // 点击修改信息按钮，渲染用户信息
    $.ajax({
        url: '/students',
        type: 'get',
        headers: {
            Authorization: 'Bearer ' + token
        },
        success: function (data) {
            // console.log(data);
            renderDetails(data.data)
        }
    })
})
// 渲染修改资料页面用户信息
function renderDetails(user) {
    let {
        name,
        avatar,
        gender,
        phone,
    } = user
    id = user._id;
    // console.log(id);
    // 渲染名字、电话
    $(`input[name="phone"]`).val(phone)
    $(`input[name="name"]`).val(name)
    // 渲染头像
    // console.log(user.avatar);
    let url = '../' + user.avatar?.split('//')[1];
    $('.avatar-info img').attr('src', url);
    $('.avatar-info img').one('error', function (e) {
        let defaultUrl = '/images/avatar01.png'
        $('.avatar-info img').attr('src', defaultUrl)
    })

    $('.avatar-info span:first-of-type').text(name || `用户${phone}`);
    // 渲染gender
    $(`input[value=${gender}]`).prop('checked', true);
    // 保持密码input为空
    $(`input[name="password"]`).val('')
}

// 修改当前用户信息
// 点击确认按钮之后
$('.infoConfirmed').on('click', function (e) {
    // 获取用户信息 avatar,name,gender,password
    let name = $(`input[name="name"]`).val()
    let password = $(`input[name="password"]`).val()

    // 获取头像
    let avatar = $('.avatar-info img').attr('src').replace('/', '/api//')
    // 获取gender
    let gender = $(`input:checked`).val()
    // console.log({
    //     id,
    //     name,
    //     avatar,
    //     gender,
    //     phone,
    //     password
    // });
    let user = {
        id,
        name,
        avatar,
        gender,
        password
    }
    // console.log(user);
    // 用户信息传递给后端 put
    $.ajax({
        url: '/students',
        type: 'put',
        data: user,
        success: function (data) {
            console.log(data);
        }
    })
    // 模态框密码信息清空

    // 关闭模态框，渲染右上角
    $('#changeInfoModal').modal('hide');
    // 重新渲染右上角
    renderUserInfo(user)
    // $('.userInfo img').attr('src',$('.avatar-info img').attr('src'))
})

//退出登录功能
$('.quitBtn').on('click', function (e) {
    // 删除token，
    sessionStorage.removeItem('token')
    location.reload()
})




//渲染对应数据统计
function renderStatistics(info) {
    let spanGroup = $('.circle-box span span');
    // console.log(spanGroup);
    spanGroup.each(function (i) {
        let attr = $(this).attr('name')
        $(this).text(info[attr] || 0)
    })
}
// console.log(aGroup);

// 登录、注册跳转
$('.login-register').on('click', 'span', function (e) {
    // 跳转到对应的功能
    // 获取id前半部分，打开对应页面
    let link = $(this).attr('id').split('-')[0]
    if (link == 'register') {
        link = 'reg'
    }
    location.href = `${link}.html`
})

//首页点击导航栏跳转
$('header .nav-ul li').on('click', function (e) {
    // console.log(token);
    now = location.pathname.split('/')[2].split('.')[0]
    if (token != null||now=='index') {
        // console.log('test');
        let name = $(this).attr('class').split(' ')[0];
        // console.log(now);
        if ((name == 'index' || name == 'tests')) {
            // 目标页面是二合一页面
            // 当前页面是二合一页面
            if (now == 'index' || now == 'tests') {
                // now = $('main.active').attr('class').split(' ')[0];
                // if (name != now) {
                //     // 切换页面
                //     $(`main.${name}`).toggleClass('active').fadeToggle(300);
                //     $(`main.${now}`).toggleClass('active').fadeToggle(300);
                //     // 切换导航栏样式
                //     $(`.nav-ul li`).removeClass('active').parent().find(`li.${name}`).addClass('active')
                //     // console.log($(`.nav-ul li`).find(`a.${name}`));
                // }
            } else {}
            location.href = `index.html?main=${name}`
        } else {
            location.href = `${name}.html`
            // console.log(name,now);
        }
    } else {
        if (confirm('请先登录！')) {
            e.preventDefault()
            location.href = `login.html`
        } else {
            e.preventDefault()
            location.href = `index.html`
        }
    }
})

//logo点击跳转
$('.logo').on('click', function (e) {
    location.href = `index.html?main=index`
})

export async function init() {
    token = sessionStorage.getItem('token')
    if (token) {
        // console.log(token);
        // 更改登录、注册框为用户信息展示框
        $('.login-register').css('display', 'none')
        $('.logged-box').css('display', 'flex')
        // 渲染用户信息 接口 renderPer
        let re = await $.ajax({
            url: '/students',
            type: 'get',
            headers: {
                Authorization: 'Bearer ' + token
            }
        })
        userInfo = re.data
        id = userInfo._id
        renderUserInfo(userInfo)
    }
    return userInfo
}

//排行榜信息渲染
function getRank() {
    console.log(id);
    $('#rankBtn').on('click', function (e) {
        $.ajax({
            url: `/testeds/rank/${id}`,
            type: 'post',
            success: function (data) {
                // console.log(data);
                renderRank(data.data)
            }
        })
    })
}

function renderRank(list) {
    // console.log(i);
    $('#rankModal tbody').html('')
    console.log(list);
    // list.sort((a, b) => b.score - a.score)
    list.forEach((info, i) => {
        let $newList =
            $(`<tr data-testedId=${info._id}>
                <td>${i+1}</td>
                <td>${info.title}</td>
                <td>${info.score}</td>
             </tr>`)
        $('#rankModal tbody').append($newList)
    })
}

// 暴露从token获取的用户信息
export {
    userInfo,
    token,
    id
}