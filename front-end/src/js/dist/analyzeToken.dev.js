"use strict";

require('jquery/dist/jquery.min'); // 登录、注册跳转


$('.login-register').on('click', 'span', function (e) {
  // 跳转到对应的功能
  // 获取id前半部分，打开对应页面
  var link = $(this).attr('id').split('-')[0];

  if (link == 'register') {
    link = 'reg';
  }

  location.href = "".concat(link, ".html");
});
var token, id;
$(window).on('load', function (e) {
  // 检查当前页面是index还是tests试卷页面
  var now = $('main.active').attr('class').split(' ')[0]; // console.log(now);

  $('main').css('display', 'none');
  $("main.".concat(now)).fadeIn(300);
  $(".nav-ul li").removeClass('active').parent().find("li.".concat(now)).addClass('active'); //  进入首页，显示公告弹窗
  // $('#announcementModal').modal('show');
  // 获取当前session是否有token值，判断登录态

  token = sessionStorage.getItem('token');

  if (token) {
    // console.log(token);
    // 更改登录、注册框为用户信息展示框
    $('.login-register').css('display', 'none');
    $('.logged-box').css('display', 'flex'); // 渲染用户信息 接口 renderPer

    $.ajax({
      url: '/students/renderPer',
      type: 'get',
      headers: {
        Authorization: 'Bearer ' + token
      },
      success: function success(data) {
        renderUserInfo(data.data);
        id = data.data['_id']; // console.log(id);
        //FIXME 回调地狱
        // console.log(now);

        if (now == 'index') {
          // console.log('test');
          getStatistics();
        }
      }
    });
  } //无论是否登录，都渲染考试类型文字 types接口


  $.ajax({
    url: '/types/render',
    type: 'GET',
    success: function success(data) {
      // 渲染考试文字
      // console.log(data);
      var spanGroup = $('.intro-list .display-card span'); // console.log(data.data[0]['type']);

      spanGroup.each(function (i) {
        return spanGroup.eq(i).text(data.data[i]['type']);
      });
    }
  });
});