"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

require("jquery/dist/jquery.min");

require("bootstrap/dist/css/bootstrap.min.css");

require("bootstrap/dist/js/bootstrap.min");

require("../css/header-footer.css");

require("../css/index.css");

require("../css/tests.css");

require("../css/modal.css");

var _testCover = _interopRequireDefault(require("../image/test-cover01.png"));

var _testCover2 = _interopRequireDefault(require("../image/test-cover02.png"));

var _testCover3 = _interopRequireDefault(require("../image/test-cover03.png"));

var _testCover4 = _interopRequireDefault(require("../image/test-cover04.png"));

var _testCover5 = _interopRequireDefault(require("../image/test-cover05.png"));

var _testCover6 = _interopRequireDefault(require("../image/test-cover06.png"));

var _moment = _interopRequireDefault(require("moment"));

var Util = _interopRequireWildcard(require("./util"));

var _analyzeToken = require("./analyzeToken");

var Loading = _interopRequireWildcard(require("./loading"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

//引入第三方资源，地址基于node_module
var id;
$(function _callee() {
  var user, now;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // 显示loading页面
          $('#loading-mask').fadeIn(10);
          _context.next = 3;
          return regeneratorRuntime.awrap((0, _analyzeToken.init)());

        case 3:
          user = _context.sent;

          // 从token中解析信息，获取id
          if (sessionStorage.getItem('announce') == null) {
            sessionStorage.setItem('announce', false); //  进入首页，显示公告弹窗

            $('#announcementModal').modal('show');
          }

          if (location.search) {
            now = location.search.split('main=')[1];
            $('main').removeClass('active');
            $("main.".concat(now)).addClass('active'); // 没有点击，默认是每日一测，typeId表示类型为每日一测

            $('main.tests').data('typeId', '6256338f1a34000097001cc6');
          } else {
            // 检查当前页面是index还是tests试卷页面
            now = $('main.active').attr('class').split(' ')[0];
          } //console.log(now);


          if (user) {
            id = user._id; // //console.log(now);

            $('main').css('display', 'none');
            $("main.".concat(now)).fadeIn(300); // id = 
            // id = data.data['_id']
            // // getRank()
            // //FIXME 回调地狱
            // // //console.log(now);

            initIndex();
            getStatistics();
            renderTestList();
            setTimeout(function () {
              clearInterval(Loading.timer);
              $('#loading-mask').fadeOut(200);
            }, 500);
          } else if (now == 'tests') {
            if (confirm('请先登录！')) {
              location.href = "login.html";
            }
          }

        case 7:
        case "end":
          return _context.stop();
      }
    }
  });
});

function initIndex() {
  //无论是否登录，都渲染考试类型文字 types接口
  $.ajax({
    url: '/types/render',
    type: 'GET',
    success: function success(data) {
      // 渲染考试文字
      // //console.log(data);
      var spanGroup = $('.intro-list .display-card span'); // //console.log(data.data[0]['type']);

      spanGroup.each(function (i) {
        spanGroup.eq(i).text(data.data[i]['type']); // //console.log(data.data[i]['_id']);

        spanGroup.eq(i).parents('.display-card').data('type', data.data[i]['_id']);
      });
    }
  });
}

$('.intro-list .display-card').on('click', function (e) {
  if (id != undefined && id != null) {
    // 切换页面
    $("main.index").toggleClass('active').fadeToggle(300);
    $("main.tests").toggleClass('active').fadeToggle(300); // 回到顶部

    $('body,html').animate({
      scrollTop: 0
    }, 300); // // 切换导航栏样式

    $(".nav-ul li").removeClass('active').parent().find("li.tests").addClass('active'); // //console.log($(`.nav-ul li`).find(`a.${name}`));
    // 调用试卷列表渲染函数,传testId

    var typeId = $(this).data('type'); // //console.log(typeId);

    $('main.tests').data('typeId', typeId);
  } else {
    alert('请用户登录后再查看试卷信息');
  }
});

function getStatistics() {
  // 动态渲染 用户数据统计信息
  // //console.log(id);
  $.ajax({
    url: "/students/".concat(id),
    type: 'POST',
    success: function success(data) {
      if (data.code == 200) {
        console.log(data.data); // 渲染对应的数据

        renderStatistics(data.data);
      }
    }
  });
} //渲染对应数据统计


function renderStatistics(info) {
  // //console.log('test');
  var spanGroup = $('.circle-box span span'); // //console.log(spanGroup);

  spanGroup.each(function (i) {
    var attr = $(this).attr('name');
    $(this).text(parseInt(info[attr] * 100) / 100 || 0);
  });
}

function renderTestList() {
  // 从后端获取所有试卷列表，以及所以已经考过的试卷的列表
  // 筛选已经考过的试卷，传入学生id，在后端查询所有包含该学生id的试卷
  // 上半部分--可以参加的考试：有效1 + 未考过 (所有-该学生考过)
  // 当前学生id
  //获取该学生参加过得所有考试的id
  var testIds = [];
  var testedIds = [];
  var durations = [];
  $.ajax({
    url: "/tests/".concat(id),
    type: 'get',
    success: function success(data) {
      testIds = data.stuTested;
      testedIds = data.testedIds;
      durations = data.durations;
      getTestList(testIds, testedIds, durations);
    }
  });
}

function getTestList(testedIds, _ids, duration) {
  // //console.log(duration);
  // //console.log(id);
  //存可以参加的考试的试卷id，唯一 testId
  var todoTest = [];
  var doneTest = [];
  $.ajax({
    url: '/tests',
    type: 'GET',
    success: function success(data) {
      //储存所有试卷的信息
      var allList = data.data;
      allList.forEach(function (test, i) {
        var index = testedIds.indexOf(test['_id']);

        if (index > -1) {
          // 已考过包含正在进行考试的项目即，分数为null
          // //console.log(duration[index]);
          // 判断：durations | 分隔的后一位是否超过现在的时间
          // !=undefined?duration[i].durations:null
          var lastTime = duration[index].split('|')[1] || null; // lastTime==null表示考试已经结束了
          //console.log(lastTime,moment(lastTime).isSameOrBefore(moment()));

          if (lastTime != null && (0, _moment["default"])(lastTime).isSameOrBefore((0, _moment["default"])())) {
            //     // 已经过期,考试超时，自动结束，进入done
            // //console.log(test);
            doneTest.push([test, _ids[index], 'expired']);
          } else if (lastTime == null) {
            //考试已结束，当前值包含’分钟‘，是计算后的结果
            doneTest.push([test, _ids[index], '']);
          } else {
            // 未过期，进入todo
            todoTest.push([test, 'emergency']);
          }
        } else {
          if (test.form == 1) {
            todoTest.push(test);
          }
        }
      }); // //console.log(doneTest, todoTest);
      // 只存储未考过的试卷，即！=testedId

      if (doneTest.length == 0) {
        // 当前没有参加过考试
        $('#done-tests').css('visibility', 'hidden'); // let $newP = $('<p>当前还没有参加过一次完整的考试哦</p>');
        // $('#done-tests').html('').append($newP);
      } else {
        $('#done-tests').css('visibility', 'visible');
        createDoneTests(doneTest);
      }

      createTodoList(todoTest);
    }
  });
}

function createDoneTests(list) {
  var imagesGroup = [_testCover["default"], _testCover2["default"], _testCover3["default"], _testCover4["default"], _testCover5["default"], _testCover6["default"]];
  var inner = $('#done-tests')[0].innerHTML; // console.log(inner);

  $('#done-tests').html(inner);
  list.forEach(function (infos, i) {
    // 检查是否需要修改状态
    var state = ['已完成', '']; //console.log(infos[2]);

    if (infos[2] == 'expired') {
      // 标注考试超时，可以查看解析
      state = ['考试超时', 'expired'];
    }

    var info = infos[0];
    var schedule = Util.getTestSchedule(info); // let minutes = info.durations.slice(0, -2)
    // let day = info.startTime.split('/').concat(info.date)
    // day[1]--;
    // let start = moment(day).format("YYYY-MM-DD HH:mm")
    // let end = moment(day).add(minutes, 'm').format("YYYY-MM-DD HH:mm")
    // if(info[2])

    var pic = Math.floor(Math.random() * 6); // //console.log(pic,imagesGroup[pic]);

    var $newList = $("<div class=\"test-list\" data-id=\"".concat(info._id, "\">\n        <img src=").concat(imagesGroup[pic], " alt=\"\">\n        <div class=\"text-part\">\n            <p>").concat(info.title, "<span class=\"tag theme-btn done ").concat(state[1], "\">").concat(state[0], "</span></p>\n        <p><span>").concat(schedule, "</span><span class=\"limited-time\">\u9650\u65F6").concat(info.durations, "</span>\n        </div>\n        <button class=\"theme-btn\">\u67E5\u770B</button>\n    </div>")); // //console.log($newList);
    // $newList.find('img').attr('src', )
    // //console.log($newList.find('img'));

    $newList.on('click', 'button', function (e) {
      // //console.log($(this).parents('.test-list').data('id'));
      var testId = $(this).parents('.test-list').data('id'); // //console.log(id);
      // console.log(infos[1],state[1]);

      var typeId = $('main.tests').data('typeId');
      location.href = "answers.html?info=".concat(infos[1][0], "&").concat(state[1]);
    }); // //console.log($newList.find('img'));
    // 添加进试卷列表

    $('#done-tests').append($newList);
  });
}

function createTodoList(list) {
  var imagesGroup = [_testCover["default"], _testCover2["default"], _testCover3["default"], _testCover4["default"], _testCover5["default"], _testCover6["default"]]; // //console.log(cover_1);

  var inner = $('#todo-tests')[0].innerHTML;
  console.log(inner);
  $('#todo-tests').html('').append(inner);
  list.forEach(function (info, i) {
    var state;

    if (info.length > 1) {
      // //console.log(info);
      state = ['正在进行', info[1]];
      info = info[0];
    } else {
      state = ['可参加', ''];
    } // //console.log(info);
    // let minutes = info.durations.slice(0, -2)
    // let day = info.startTime.split('/').concat(info.date)
    // day[1]--;
    // let start = moment(day).format("YYYY-MM-DD HH:mm")
    // let end = moment(day).add(minutes, 'm').format("YYYY-MM-DD HH:mm")


    var schedule = Util.getTestSchedule(info);
    var pic = Math.floor(Math.random() * 6);
    var $newList = $(" <div class=\"test-list\" data-id=\"".concat(info._id, "\">\n    <img src=").concat(imagesGroup[pic], " alt=\"\">\n    <div class=\"text-part\">\n        <p>").concat(info.title, "<span class=\"tag theme-btn todo ").concat(state[1], "\">").concat(state[0], "</span></p>\n        <p><span>").concat(schedule, "</span><span class=\"limited-time\">\u9650\u65F6").concat(info.durations, "</span>\n        </p>\n    </div>\n    <button class=\"theme-btn ").concat(state[1], "\">\u8FDB\u5165</button>\n    </div>"));
    $newList.find('img').attr('src', imagesGroup[pic]);
    $newList.on('click', 'button', function (e) {
      var testId = $(this).parents('.test-list').data('id'); // 跳转页面，传testId信息
      // //console.log(id);

      var typeId = $('main.tests').data('typeId');
      location.href = "tests-basic-info.html?test=".concat(testId, "&stu=").concat(id, "&type=").concat(typeId); // //console.log();
    }); // //console.log($newList.find('img'));
    // 添加进试卷列表

    $('#todo-tests').append($newList);
  });
} //点击首页span标签，跳转到首页


$('.purple').on('click', function (e) {
  location.href = "index.html";
});