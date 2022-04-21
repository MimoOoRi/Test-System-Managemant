"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

require("jquery/dist/jquery.min");

require("bootstrap/dist/css/bootstrap.min.css");

require("bootstrap/dist/js/bootstrap.min.js");

require("../css/header-footer.css");

require("../css/collections.css");

require("../css/modal.css");

var _moment = _interopRequireDefault(require("moment"));

var Util = _interopRequireWildcard(require("./util"));

var Token = _interopRequireWildcard(require("./analyzeToken"));

var Loading = _interopRequireWildcard(require("./loading"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

//引入第三方资源，地址基于node_module
//先检测是否登录，检查是否有token传回来
// let single = []
// let multi = []
var single = 0;
var multi = 0;
var coGroup = [];
var stuId;
$(function _callee() {
  var user, re;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // 显示loading页面
          $('#loading-mask').fadeIn(10);
          _context.next = 3;
          return regeneratorRuntime.awrap(Token.init());

        case 3:
          user = _context.sent;

          if (!user) {
            _context.next = 14;
            break;
          }

          stuId = user._id; // 渲染title

          $('h3').text('习题收藏夹'); // 获取错题本列表

          _context.next = 9;
          return regeneratorRuntime.awrap(getAjaxData("/collections/render", 'get', {
            stuId: stuId
          }));

        case 9:
          re = _context.sent;
          // console.log(re);
          coGroup = re.data; // console.log(coGroup);

          if (coGroup.length == 0) {
            if (confirm('当前收藏夹为空,即将回到首页')) {
              location.href = 'index.html';
            }
          } else {
            // console.log(coGroup);
            coGroup.sort(function (a, b) {
              return a.exerciseId.type - b.exerciseId.type;
            }); //习题分类，单选、多选

            coGroup.forEach(function (co, i) {
              if (co.exerciseId.type == 0) {
                // 单选
                single++; // single.push(co.exerciseId)

                $('.single').css('display', 'block'); //渲染题目

                createTag(i, single, 'single');
                renderQuestions(i, single);
              } else {
                multi++; // multi.push(co.exerciseId)

                $('.multi').css('display', 'block'); //渲染题目

                createTag(i, multi, 'multi');
                renderQuestions(i, multi);
              }
            }); // 渲染左侧答题卡
            // renderAnswerCard()

            clearInterval(Loading.timer);
            $('#loading-mask').fadeOut(200); // setTimeout(function () {
            // }, 300)
          }

          _context.next = 15;
          break;

        case 14:
          if (confirm('请先登录！')) {
            location.href = "login.html";
          } else {
            location.href = "index.html";
          }

        case 15:
        case "end":
          return _context.stop();
      }
    }
  });
});

function createTag(index, i, name) {
  // 新建答题卡标签
  var $newTab = $(" \n    <div class=\"tag ".concat(name, "-").concat(i, "\">\n        <div class=\"ans correct \">").concat(i, "</div>\n    </div>"));
  $(".ques-part.".concat(name, " .tag-box")).append($newTab);
  $newTab.on('click', function (e) {
    // 获取当前习题的跳转目标
    var target = $(this).attr('class').split(' ')[1];
    console.log(target); // console.log($(`#${target}`).offset().top);
    // FIXME 第二次点击回到0，因为基于当前窗口的高度
    // $('html,body').animate({
    //     // console.log($(`#${target}`).top);
    //     scrollTop: $(`#${target}`).offset().top-150
    // }, 300)

    var scroll = $(".exercise.".concat(target)).data('scroll') - 150; // console.log(scroll);
    // FIXME 第二次点击回到0，因为基于当前窗口的高度

    $('.main-content').animate({
      scrollTop: scroll
    }, 300);
  });
}

function renderQuestions(i, index) {
  // index 表示在类型题集中的下标
  var info = coGroup[i].exerciseId; // console.log(info);

  var type = 'radio',
      name = 'single';

  if (info.type == 1) {
    // 显示多选分类
    type = 'checkbox';
    name = 'multi';
  } // 新建问题


  var $newQues = $("  \n        <div class=\"exercise ".concat(name, "-").concat(index, "\">\n            <div class=\"collect\"><span></span>\u5220\u9664</div>\n            <div class=\"question-part\" data-question=\"").concat(i, "\" id=\"").concat(name, "-").concat(index, "\" data-id = ").concat(info._id, ">\n                <div class=\"title\">\n                ").concat(index, ". \n                <pre>").concat(info.topics, "</pre>\n                </div>\n                <ul class=\"choice-list\">\n                    <li>\n                        <input type=").concat(type, " name=\"").concat(name, "-").concat(index, "\" value='0' id=\"").concat(name, "-").concat(index, "-a\">\n                        <label for=\"").concat(name, "-").concat(index, "-a\">A. ").concat(info.options[0], "</label>\n                    </li>\n                    <li>\n                        <input type=").concat(type, " name=\"").concat(name, "-").concat(index, "\" value='1' id=\"").concat(name, "-").concat(index, "-b\">\n                        <label for=\"").concat(name, "-").concat(index, "-b\">B. ").concat(info.options[1], "</label>\n                    </li>\n                    <li>\n                        <input type=").concat(type, " name=\"").concat(name, "-").concat(index, "\" value='2' id=\"").concat(name, "-").concat(index, "-c\">\n                        <label for=\"").concat(name, "-").concat(index, "-c\">C. ").concat(info.options[2], "</label>\n                    </li>\n                    <li>\n                        <input type=").concat(type, " name=\"").concat(name, "-").concat(index, "\" value='3' id=\"").concat(name, "-").concat(index, "-d\">\n                        <label for=\"").concat(name, "-").concat(index, "-d\">D. ").concat(info.options[3], "</label>\n                    </li>\n                </ul>\n            </div>\n            <div class=\"answer-part\" data-question=\"").concat(index, "\">\n            </div>\n        </div>")); // console.log(coGroup[i]._id);

  $newQues.find('.collect').data('collect', coGroup[i]._id); // console.log($newQues.find('.collect').data('collect'));
  // name表示当前是多选还是单选

  $(".main-content .".concat(name, " .exercise-box")).append($newQues); // 储存当前位置

  $newQues.data('scroll', $newQues.offset().top);
  console.log($newQues, $newQues.data('scroll')); // $('.main-content .exercise').append($newQues)

  var exInfo = coGroup[i].exerciseId; // console.log(exInfo);

  var ans = exInfo.answer;
  var character = ['A', 'B', 'C', 'D'];
  var ansChar = ans.map(function (i) {
    return character[i];
  }); // console.log(ans);

  var $newAnalysis = $("\n        <p>\u6B63\u786E\u7B54\u6848\uFF1A<span class=\"correct\">".concat(ansChar, "</span></p>\n        <p>\u7B54\u6848\u89E3\u6790\uFF1A<span class=\"analysis\"><pre>").concat(exInfo.analysis, "</pre></span></p>"));
  $newQues.find('.answer-part').append($newAnalysis); // //根据考生答案，为input设定选中状态和样式
  // console.log(ans);
  //修改input答案样式

  ans.forEach(function (a) {
    // let i = 'ABCD'.indexOf(a) + 1
    // console.log(a+1);
    $newQues.find("li:nth-child(".concat(a + 1, ")")).addClass('active');
    $newQues.find("li:nth-child(".concat(a + 1, ") input")).prop({
      'checked': true,
      'disabled': true
    });
  });
} // 选择答案，切换样式


$('.exercise-box').on('click', '.collect', delCollect);

function delCollect() {
  var $ques, index, Num, exIndex, type, collectId, length, i, $title, re;
  return regeneratorRuntime.async(function delCollect$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          // console.log($(this));
          $ques = $(this).next('.question-part'); // 下标，为了快速查找

          index = $ques.data('question');
          Num = $ques.attr('id').split('-')[1]; // 当前试题的位置，之后的题都需要修改

          exIndex = $(this).parents('.exercise').index();
          type = $ques.attr('id').split('-')[0];
          collectId = $(this).data('collect');
          $(this).parents('.exercise').remove();
          $(".tag.".concat(type, "-").concat(Num)).remove(); // console.log(index);
          // let type = coGroup[index].exerciseId.type
          // let queNum = $(this).parents('.exercise').attr('id')

          length = type == 'single' ? single : multi; // console.log(length);
          // console.log(type);
          // if()
          // console.log(queNum);

          coGroup.splice(index, 1); // // 重新渲染从index向后的元素

          for (i = Num; i <= length; i++, exIndex++) {
            // console.log(i,length);
            // 只修改题号
            $title = $("#".concat(type, "-").concat(i)).find('.title'); // console.log($title);

            $title.text("".concat($title.text().replace(/^.+\./, "".concat(exIndex, ".")))); //修改tag内容

            $(".tag.".concat(type, "-").concat(i)).find('.ans').text(exIndex);
          } // let exId;
          // // 取消
          // // console.log('cancel');
          // console.log($(this));
          // console.log(index);
          // let collectId = coGroup[index]._id
          // console.log(collectId);


          _context2.next = 13;
          return regeneratorRuntime.awrap(Util.getAjax("/collections/".concat(collectId), 'delete'));

        case 13:
          re = _context2.sent;
          console.log(re.mes);

        case 15:
        case "end":
          return _context2.stop();
      }
    }
  }, null, this);
}

function getAjaxData(url, type, data) {
  return regeneratorRuntime.async(function getAjaxData$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap($.ajax({
            url: url,
            type: type,
            data: data
          }));

        case 2:
          return _context3.abrupt("return", _context3.sent);

        case 3:
        case "end":
          return _context3.stop();
      }
    }
  });
}

$('.theme-btn').on('click', function (e) {
  // 跳转到首页
  location.href = "index.html";
});