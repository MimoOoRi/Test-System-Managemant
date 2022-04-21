"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

require("jquery/dist/jquery.min");

require("bootstrap/dist/css/bootstrap.min.css");

require("bootstrap/dist/js/bootstrap.min.js");

require("../css/header-footer.css");

require("../css/answers.css");

require("../css/modal.css");

var _moment = _interopRequireDefault(require("moment"));

var Util = _interopRequireWildcard(require("./util"));

var Token = _interopRequireWildcard(require("./analyzeToken"));

var Loading = _interopRequireWildcard(require("./loading"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

// 获取试卷信息
var expired = location.search.split('&')[1] || null;
var testedId = location.search.split('&')[0].split('=')[1];
var single = [];
var multi = [];
var stuId;
$(function _callee() {
  var user, exRE, re, testInfo, _stuAns, testRe, exGroup;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // 显示loading页面
          $('#loading-mask').fadeIn(10);
          console.log(testedId);
          _context.next = 4;
          return regeneratorRuntime.awrap(Token.init());

        case 4:
          user = _context.sent;

          if (!user) {
            _context.next = 26;
            break;
          }

          if (!(expired != null)) {
            _context.next = 11;
            break;
          }

          _context.next = 9;
          return regeneratorRuntime.awrap(getAjax("/testeds/".concat(testedId), 'patch'));

        case 9:
          exRE = _context.sent;
          console.log(exRE);

        case 11:
          _context.next = 13;
          return regeneratorRuntime.awrap(getAjax("/testeds/".concat(testedId), 'get'));

        case 13:
          re = _context.sent;
          stuId = re.stuInfo._id;
          testInfo = re.testEnd;
          _stuAns = testInfo.answers; // console.log(testInfo);

          _context.next = 19;
          return regeneratorRuntime.awrap(getAjax("/exercises/analysis/".concat(testInfo.testId), 'get'));

        case 19:
          testRe = _context.sent;
          exGroup = testRe.data.exerciseId; // console.log(exGroup);
          // 渲染右侧信息展示栏

          renderExamInfo(testInfo);
          renderAnswerCard(exGroup, _stuAns);
          setTimeout(function () {
            clearInterval(Loading.timer);
            $('#loading-mask').fadeOut(200);
          }, 200);
          _context.next = 27;
          break;

        case 26:
          if (confirm('请先登录！')) {
            location.href = "login.html";
          } else {
            location.href = "index.html";
          }

        case 27:
        case "end":
          return _context.stop();
      }
    }
  });
});

function renderExamInfo(info) {
  // 修改考试成绩、时长
  $('.exam-score').text(info.score);
  $('.exam-time').text(info.durations);
}

function renderAnswerCard(testInfo, stuAns) {
  console.log(stuAns);

  if (stuAns.length == 0) {
    stuAns = new Array(testInfo.length).fill([]);
  } // 单选题框,筛选试题type0
  // let $ne
  // let single, multi = 0;


  $('.tag-box').html('');
  $('.exercise-box').html('');
  testInfo.forEach(function (info, i) {
    // console.log(info.type);
    if (info.type == 0) {
      // 单选 
      single.push(info);
      createQuestion(info, 'single', single.length, stuAns[i]);
    } else {
      multi.push(info);
      createQuestion(info, 'multi', multi.length, stuAns[i]);
    }
  }); // console.log(single, multi);
  // singleAnsArr = new Map(single.length).fill([])
  // multiAnsArr = new Map(multi.length).fill([])
}

function createQuestion(info, name, index, stuAns) {
  var state = [];
  var type = 'radio';

  if (name == 'multi') {
    // 显示多选分类
    $('.multi').css('display', 'block');
    type = 'checkbox'; // $('main-content .multi').css('display', 'block');
  } // console.log(stuAns);
  // 判断正误 练习题id info._id
  // 试题答案通过info获取，学生答案从ajax后端获取， 学生答案的顺序此时==正确答案顺序
  // console.log(stuAns,info.answer);


  var ans = info.answer.sort();

  if (stuAns != undefined && stuAns.join('') == ans.join('')) {
    state = ['correct', '答对了'];
  } else {
    state = ['wrong', '答错了'];
  } // index表示当前是单选、多选中的第几题，单选多选分开计数
  // 新建答题卡标签


  var $newTab = $(" \n    <div class=\"tag ".concat(name, "-").concat(index, "\">\n        <div class=\"ans ").concat(state[0], "\">").concat(index, "</div>\n        <div class=\"collect\"></div>\n    </div>")); // 新建问题

  var $newQues = $(" \n        <div class=\"exercise\" id=\"".concat(name, "-").concat(index, "\" data-id = ").concat(info._id, ">\n            <div class=\"collect\"><span></span>\u6536\u85CF</div>\n            <div class=\"question-part\" data-question=\"").concat(index, "\">\n                <div class=\"title\">\n                    <pre>").concat(info.topics, "</pre>\n                </div>\n                <ul class=\"choice-list\">\n                    <li>\n                        <input type=").concat(type, " name=\"").concat(name, "-").concat(index, "\" value='0' id=\"").concat(name, "-").concat(index, "-a\">\n                        <label for=\"").concat(name, "-").concat(index, "-a\">A. ").concat(info.options[0], "</label>\n                    </li>\n                    <li>\n                        <input type=").concat(type, " name=\"").concat(name, "-").concat(index, "\" value='1' id=\"").concat(name, "-").concat(index, "-b\">\n                        <label for=\"").concat(name, "-").concat(index, "-b\">B. ").concat(info.options[1], "</label>\n                    </li>\n                    <li>\n                        <input type=").concat(type, " name=\"").concat(name, "-").concat(index, "\" value='2' id=\"").concat(name, "-").concat(index, "-c\">\n                        <label for=\"").concat(name, "-").concat(index, "-c\">C. ").concat(info.options[2], "</label>\n                    </li>\n                    <li>\n                        <input type=").concat(type, " name=\"").concat(name, "-").concat(index, "\" value='3' id=\"").concat(name, "-").concat(index, "-d\">\n                        <label for=\"").concat(name, "-").concat(index, "-d\">D. ").concat(info.options[3], "</label>\n                    </li>\n                </ul>\n            </div>\n            <div class=\"answer-part\" data-question=\"").concat(index, "\">\n            </div>\n        </div>")); // name表示当前是多选还是单选

  $(".ques-part.".concat(name, " .tag-box")).append($newTab);
  $(".main-content .".concat(name, " .exercise-box")).append($newQues); //根据考生答案，为input设定选中状态和样式

  var character = ['A', 'B', 'C', 'D'];

  var stuChar = _toConsumableArray(stuAns).map(function (i) {
    $newQues.find(".choice-list li:nth-child(".concat(i + 1, ")")).addClass('active').find("input").prop('checked', true);
    return character[i];
  });

  var ansChar = _toConsumableArray(ans).map(function (i) {
    return character[i];
  }); //根据考生答案，为input设定选中状态和样式
  // $newQues.find(`.choice-list li:nth-child(${}) input`).


  var $newAnalysis = $("<p class=\"ans ".concat(state[0], "\">").concat(state[1], "</p>\n        <p>\u8003\u751F\u7B54\u6848\uFF1A<span class=\"answer ").concat(state[0], "\">").concat(stuChar, "</span></p>\n        <p>\u6B63\u786E\u7B54\u6848\uFF1A<span class=\"correct\">").concat(ansChar, "</span></p>\n        <p>\u7B54\u6848\u89E3\u6790\uFF1A<span class=\"analysis\"><pre>").concat(info.analysis, "</pre></span></p>"));
  $newQues.find('.answer-part').html('').append($newAnalysis);
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

function fnAnswer() {
  var id, type, target, index, arr;
  return regeneratorRuntime.async(function fnAnswer$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          id = $(this).parents('.exercise').data('id');
          console.log(id); // 点击input或者对应label
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
            stuAns[id] = [Number($(this).val())]; // console.log(singleAnsArr);
            //答题进度+1，长度加，百分比
            // renderProgress(1)
          } else {
            // 多选，获取所有答案
            // console.log($(`input[name="${target}"]:checked`));
            arr = [];
            $("input[name=\"".concat(target, "\"]:checked")).each(function () {
              arr.push(Number($(this).val()));
            });
            stuAns[id] = arr; // console.log(multiAnsArr[3]);
            // 答题进度+1
            // renderProgress(1)
          } // 取消选择,针对多选，为空，修改答题框样式，


          if ($("input[name=\"".concat(target, "\"]:checked")).length == 0) {
            $(".tag.".concat(target, " .ans")).addClass('todo').removeClass('done'); // //答题进度-1
            // renderProgress(-1)
          }

          renderProgress();

        case 10:
        case "end":
          return _context2.stop();
      }
    }
  }, null, this);
} // 选择答案，切换样式


$('button.theme-btn').on('click', function (e) {
  // console.log($(this));
  location.href = "index.html?main=tests";
});

function fnCollect() {
  var id, queNum, exId, collectId, re;
  return regeneratorRuntime.async(function fnCollect$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          id = $(this).parents('.exercise').data('id');
          queNum = $(this).parents('.exercise').attr('id'); // console.log(queNum);
          // 修改对应tag的样式

          $(".tag.".concat(queNum, " .collect")).toggleClass('active'); // 点击收藏，切换五角星样式

          $(this).toggleClass('active'); // 直接增加到收藏夹
          // console.log(id);

          if (!$(this).hasClass('active')) {
            _context3.next = 11;
            break;
          }

          _context3.next = 7;
          return regeneratorRuntime.awrap(getAjax("/collections/".concat(id, "/").concat(stuId), 'post'));

        case 7:
          exId = _context3.sent;
          $(this).data('collect', exId);
          _context3.next = 16;
          break;

        case 11:
          // 取消
          // console.log('cancel');
          collectId = $(this).data('collect');
          _context3.next = 14;
          return regeneratorRuntime.awrap(getAjax("/collections/".concat(collectId), 'delete'));

        case 14:
          re = _context3.sent;
          console.log(re.mes);

        case 16:
        case "end":
          return _context3.stop();
      }
    }
  }, null, this);
}

function getAjax(url, type) {
  return $.ajax({
    url: url,
    type: type
  });
}