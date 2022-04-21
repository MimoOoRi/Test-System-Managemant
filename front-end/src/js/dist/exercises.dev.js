"use strict";

require("font-awesome/css/font-awesome.css");

var _moment = _interopRequireDefault(require("moment"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

//引入第三方资源，地址基于node_module
require('jquery/dist/jquery.min');

require('bootstrap/dist/css/bootstrap.min.css');

require('bootstrap/dist/js/bootstrap.min.js');

require('../css/exercises.css');

require('../css/modal.css'); // require("font-awesome")
// require('font-awesome-webpack');


// import "font-awesome"
// 页面渲染
var testId = location.search.substring(1).split('&')[0].split('=')[1]; // 获取学生id

var stuId = location.search.substring(1).split('&')[1].split('=')[1];
var typeId = location.search.substring(1).split('&')[2].split('=')[1];
var singleAnsArr;
var multiAnsArr;
var testInfo;
var single = [];
var multi = [];
var exGroupId = [];
$(function _callee() {
  var already, re, startTime;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log('loading!!!'); // TODO 加载动画，一开始就显示加载动画，被阻塞，直到获取到数据，取消加载
          // 当前试卷是否已经被打开过

          _context.next = 3;
          return regeneratorRuntime.awrap(getAjax("/testeds/".concat(testId), 'post'));

        case 3:
          already = _context.sent;
          _context.next = 6;
          return regeneratorRuntime.awrap(getAjax("/tests/".concat(testId), 'post'));

        case 6:
          re = _context.sent;
          exGroupId = re.data;
          _context.next = 10;
          return regeneratorRuntime.awrap(getAjax("/exercises/".concat(exGroupId), 'post'));

        case 10:
          re = _context.sent;
          testInfo = re.data; // 渲染答题卡

          renderAnswerCard(testInfo); // 将当前打开开始时间存进数据库

          if (!(testedId == undefined)) {
            _context.next = 21;
            break;
          }

          // 没有数据
          startTime = (0, _moment["default"])().format("YYYY-MM-DD HH:mm:ss");
          _context.next = 17;
          return regeneratorRuntime.awrap(setTimer(startTime));

        case 17:
          testedId = _context.sent;
          // 将testedId作为main-content的自定义属性
          console.log(testedId);
          _context.next = 24;
          break;

        case 21:
          _context.next = 23;
          return regeneratorRuntime.awrap(getTimer(testedId));

        case 23:
          startTime = _context.sent;

        case 24:
          $('.main-content').data('timeId', testedId);
          console.log('start!!!');
          console.log(startTime);

        case 27:
        case "end":
          return _context.stop();
      }
    }
  });
});

function renderAnswerCard(testInfo) {
  // 单选题框,筛选试题type0
  // let $ne
  // let single, multi = 0;
  $('.tag-box').html('');
  $('.exercise-box').html('');
  testInfo.forEach(function (info) {
    // console.log(info.type);
    if (info.type == 0) {
      // 单选
      single.push(info);
      createQuestion(info, 'single', single.length);
    } else {
      multi.push(info);
      createQuestion(info, 'multi', multi.length);
    }
  });
  console.log(single, multi);
  singleAnsArr = new Array(single.length).fill([]);
  multiAnsArr = new Array(multi.length).fill([]);
} //答题卡
// 按照考题顺序生成左侧部分的答题卡。
// 每个卡片有 2 个状态：已答和未答。默认状态 未答。
// 当学员进行答题之后，应该同步答题卡的卡片状态，同时保存学员的答案
// 考题右侧提供了一个收藏按钮，学员可以实时收藏考题，以便于复习。
// 当针对某个考题收藏之后，与之对应的试题卡片下方，应该有一个收藏的小红心


function createQuestion(info, name, index) {
  var type = 'radio';

  if (name == 'multi') {
    // 显示多选分类
    $('.multi').css('display', 'block');
    type = 'checkbox'; // $('main-content .multi').css('display', 'block');
  } // index表示当前是单选、多选中的第几题，单选多选分开计数
  // 新建答题卡标签


  var $newTab = $(" \n                        <div class=\"tag ".concat(name, "-").concat(index, "\">\n                            <div class=\"ans todo\">").concat(index, "</div>\n                            <div class=\"collect\"></div>\n                        </div>")); // 新建问题

  var $newQues = $(" \n        <div class=\"exercise\" id=\"".concat(name, "-").concat(index, "\" data-id = ").concat(info._id, ">\n            <div class=\"collect\"><span></span>\u6536\u85CF</div>\n            <div class=\"question-part\" data-question=\"").concat(index, "\">\n                <div class=\"title\">").concat(info.topics, "</div>\n                <ul class=\"choice-list\">\n                    <li>\n                        <input type=").concat(type, " name=\"").concat(name, "-").concat(index, "\" value='1' id=\"").concat(name, "-").concat(index, "-a\">\n                        <label for=\"").concat(name, "-").concat(index, "-a\">A. ").concat(info.options[0], "</label>\n                    </li>\n                    <li>\n                        <input type=").concat(type, " name=\"").concat(name, "-").concat(index, "\" value='2' id=\"").concat(name, "-").concat(index, "-b\">\n                        <label for=\"").concat(name, "-").concat(index, "-b\">B. ").concat(info.options[1], "</label>\n                    </li>\n                    <li>\n                        <input type=").concat(type, " name=\"").concat(name, "-").concat(index, "\" value='3' id=\"").concat(name, "-").concat(index, "-c\">\n                        <label for=\"").concat(name, "-").concat(index, "-c\">C. ").concat(info.options[2], "</label>\n                    </li>\n                    <li>\n                        <input type=").concat(type, " name=\"").concat(name, "-").concat(index, "\" value='4' id=\"").concat(name, "-").concat(index, "-d\">\n                        <label for=\"").concat(name, "-").concat(index, "-d\">D. ").concat(info.options[3], "</label>\n                    </li>\n                </ul>\n            </div>\n        </div>")); // name表示当前是多选还是单选

  $(".ques-part.".concat(name, " .tag-box")).append($newTab);
  $(".main-content .".concat(name, " .exercise-box")).append($newQues);
} // 添加监听事件
// 答题卡界面，点击，跳转到对应习题.single-1 或者 .multi-2


$('.tag-box').on('click', '.tag', function (e) {
  // 获取当前习题的跳转目标
  var target = $(this).attr('class').split(' ')[1]; // console.log(target);
  // console.log($(`#${target}`).offset().top);
  // FIXME 第二次点击回到0，因为基于当前窗口的高度

  $('.main-content').animate({
    scrollTop: $("#".concat(target)).position().top - 150
  }, 300);
}); // 选择答案，切换样式

$('.exercise-box').on('click', '.collect,li input', function (e) {
  // console.log($(this));
  if ($(this).hasClass('collect')) {
    fnCollect.apply($(this));
  } else {
    fnAnswer.apply($(this));
  }
});

function fnCollect() {
  var id, queNum, exId, collectId, re;
  return regeneratorRuntime.async(function fnCollect$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          id = $(this).parents('.exercise').data('id');
          queNum = $(this).parents('.exercise').attr('id'); // console.log(queNum);
          // 修改对应tag的样式

          $(".tag.".concat(queNum, " .collect")).toggleClass('active'); // 点击收藏，切换五角星样式

          $(this).toggleClass('active'); // 直接增加到收藏夹
          // console.log(id);

          if (!$(this).hasClass('active')) {
            _context2.next = 11;
            break;
          }

          _context2.next = 7;
          return regeneratorRuntime.awrap(getAjax("/collections/".concat(id, "/").concat(stuId), 'post'));

        case 7:
          exId = _context2.sent;
          $(this).data('collect', exId);
          _context2.next = 16;
          break;

        case 11:
          // 取消
          // console.log('cancel');
          collectId = $(this).data('collect');
          _context2.next = 14;
          return regeneratorRuntime.awrap(getAjax("/collections/".concat(collectId), 'delete'));

        case 14:
          re = _context2.sent;
          console.log(re.mes);

        case 16:
        case "end":
          return _context2.stop();
      }
    }
  }, null, this);
}

function fnAnswer() {
  var type, target, index, arr;
  return regeneratorRuntime.async(function fnAnswer$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          // 点击input或者对应label
          // 修改答题卡的框
          // 没有任何答案被选中，恢复为todo样式
          // 获取当前input的name
          type = $(this).attr('type');
          console.log(type);
          target = $(this).attr('name');
          index = Number(target.split('-')[1]); // 增加,修改答题卡可样式

          $(".tag.".concat(target, " .ans")).addClass('done').removeClass('todo'); // 添加选择进答案数组

          if (type == 'radio') {
            // 单选题，直接覆盖答案
            singleAnsArr[index - 1] = [Number($(this).val())]; // console.log(singleAnsArr);
          } else {
            // 多选，获取所有答案
            // console.log($(`input[name="${target}"]:checked`));
            arr = [];
            $("input[name=\"".concat(target, "\"]:checked")).each(function () {
              arr.push(Number($(this).val()));
            });
            multiAnsArr[index - 1] = arr; // console.log(multiAnsArr[3]);
          } // 取消选择,针对多选，为空，修改答题框样式，


          if ($("input[name=\"".concat(target, "\"]:checked")).length == 0) {
            $(".tag.".concat(target, " .ans")).addClass('todo').removeClass('done');
          }

        case 7:
        case "end":
          return _context3.stop();
      }
    }
  }, null, this);
} //剩余时间


function setTimer(startTime) {
  var info, re, testedId;
  return regeneratorRuntime.async(function setTimer$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          // 获取打开考卷的时间，记录在
          // startTime
          // 同一学生，同一张卷子只能考一次，那么试卷的testedId是唯一的，数据也是唯一的
          info = {
            studentId: stuId,
            testId: testId,
            typeId: typeId,
            answers: [[]],
            score: 0,
            accuracy: 0,
            durations: startTime
          };
          _context4.next = 3;
          return regeneratorRuntime.awrap(getAjaxAns("/testeds", 'post', info));

        case 3:
          re = _context4.sent;
          testedId = re.tested_id; // console.log(testedId);

          return _context4.abrupt("return", testedId);

        case 6:
        case "end":
          return _context4.stop();
      }
    }
  });
}

function getTimer() {
  var url, re, start;
  return regeneratorRuntime.async(function getTimer$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          console.log(testedId);
          url = "/testeds/".concat(testedId || ''); // console.log(url);

          _context5.next = 4;
          return regeneratorRuntime.awrap(getAjax(url, 'get'));

        case 4:
          re = _context5.sent;
          // console.log(re);
          start = re.code; // console.log(start);

          return _context5.abrupt("return", start);

        case 7:
        case "end":
          return _context5.stop();
      }
    }
  });
} //当前进度


$('#submitBtn').on('click', function (e) {
  submitTest();
}); //答案存进数据库

function submitTest() {
  var ans, id, info, re;
  return regeneratorRuntime.async(function submitTest$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          // console.log(multiAnsArr, singleAnsArr);
          console.log("\u5F00\u59CB\u65F6\u95F4".concat(startTime));
          ans = singleAnsArr.concat(multiAnsArr);
          id = $('.main-content').data('timeId'); // console.log(ans);

          info = {
            _id: id,
            studentId: stuId,
            testId: testId,
            typeId: typeId,
            answers: ans,
            score: 0,
            accuracy: 0,
            durations: startTime
          };
          _context6.next = 6;
          return regeneratorRuntime.awrap(getAjaxAns("/testeds", 'post', info));

        case 6:
          re = _context6.sent;
          console.log(re);

        case 8:
        case "end":
          return _context6.stop();
      }
    }
  });
}

function getAjaxAns(url, type, data) {
  console.log(url, type, data);
  var ansJSON = JSON.stringify(data);
  return $.ajax({
    url: url,
    type: type,
    data: {
      info: ansJSON
    }
  });
}

function getAjax(url, type) {
  return $.ajax({
    url: url,
    type: type
  });
}