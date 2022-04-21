"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

require("../css/header-footer.css");

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

//引入第三方资源，地址基于node_module
require('jquery/dist/jquery.min');

require('bootstrap/dist/css/bootstrap.min.css');

require('bootstrap/dist/js/bootstrap.min.js');

require('../css/errors.css');

require('../css/modal.css');

//先检测是否登录，检查是否有token传回来
var curEx = 0;
var exGroup = [];
var stuId;
var single = 0;
var multi = 0; // let stuId = '6257cfdc86104b27f3229fb8';
// 并根据 students._id 从 errors 集合中获取当前学员的错题集合

$(function _callee() {
  var user, re;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // console.log(moment().millisecond());
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

          $('h3').text('错题本'); // 获取错题本列表

          _context.next = 9;
          return regeneratorRuntime.awrap(getAjax("/errors/".concat(stuId), 'get'));

        case 9:
          re = _context.sent;
          exGroup = re.data; // console.log(re);
          // console.log(moment().millisecond());

          if (exGroup.length == 0) {
            if (confirm('当前收藏夹为空,即将回到首页')) {
              location.href = 'index.html';
            }
          } else {
            // console.log(exGroup);
            // 渲染左侧答题卡
            renderAnswerCard(); //渲染第一道题

            createQuestion(curEx, 1); // 渲染右侧工具栏

            renderProgress();
            clearInterval(Loading.timer);
            $('#loading-mask').css('display', 'none'); // setTimeout(function() {
            //     clearInterval(Loading.timer)
            //     $('#loading-mask').fadeOut(200)
            // },1000)
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

function renderAnswerCard() {
  // 单选题框,筛选试题type0 
  single = 0;
  multi = 0;
  $('.tag-box').html('');
  exGroup.sort(function (a, b) {
    return a.type - b.type;
  });
  exGroup.forEach(function (info, i) {
    //     // 将单选插入到数组前
    // console.log(info.type);
    if (info.type == 0) {
      // 多选
      // single.push(info)
      single++;
      $('.single').css('display', 'block');
      info['target'] = "single-".concat(i);
      createTag(i, single);
    } else {
      // multi.push(info)
      multi++;
      $('.multi').css('display', 'block');
      info['target'] = "multi-".concat(i);
      createTag(i, multi);
    }
  });
}

function createTag(index, i) {
  //index 是主，i是副
  var name = exGroup[index].target.split('-')[0]; // let index = info[i].target.split('-')[1]
  // 新建答题卡标签

  var $newTab = $(" \n    <div class=\"tag ".concat(name, "-").concat(index, "\">\n        <div class=\"ans ans-").concat(i, "\"}\">").concat(i, "</div>\n    </div>"));
  $(".ques-part.".concat(name, " .tag-box")).append($newTab);
  $newTab.on('click', function (e) {
    // 显示对应的题目
    createQuestion(index, i);
  });
}

function createQuestion(index, i) {
  // console.log(i);
  curEx = index; // console.log(exGroup, index);

  var info = exGroup[index]; // console.log(info.type);

  var type = 'radio',
      name = 'single';

  if (info.type == 1) {
    // 显示多选分类
    type = 'checkbox';
    name = 'multi';
  } // 新建问题


  var $newQues = $("  \n            <div class=\"question-part\" data-question=\"".concat(index, "\" id=\"").concat(name, "-").concat(index, "\" data-id = ").concat(info._id, ">\n                <div class=\"title\">").concat(i, ". \n                <pre>").concat(info.topics, "</pre>\n                </div>\n                <ul class=\"choice-list\">\n                    <li>\n                        <input type=").concat(type, " name=\"").concat(name, "-").concat(index, "\" value='0' id=\"").concat(name, "-").concat(index, "-a\">\n                        <label for=\"").concat(name, "-").concat(index, "-a\">A. ").concat(info.options[0], "</label>\n                    </li>\n                    <li>\n                        <input type=").concat(type, " name=\"").concat(name, "-").concat(index, "\" value='1' id=\"").concat(name, "-").concat(index, "-b\">\n                        <label for=\"").concat(name, "-").concat(index, "-b\">B. ").concat(info.options[1], "</label>\n                    </li>\n                    <li>\n                        <input type=").concat(type, " name=\"").concat(name, "-").concat(index, "\" value='2' id=\"").concat(name, "-").concat(index, "-c\">\n                        <label for=\"").concat(name, "-").concat(index, "-c\">C. ").concat(info.options[2], "</label>\n                    </li>\n                    <li>\n                        <input type=").concat(type, " name=\"").concat(name, "-").concat(index, "\" value='3' id=\"").concat(name, "-").concat(index, "-d\">\n                        <label for=\"").concat(name, "-").concat(index, "-d\">D. ").concat(info.options[3], "</label>\n                    </li>\n                </ul>\n            </div>\n            <div class=\"answer-part\" data-question=\"").concat(index, "\">\n            </div>\n        </div>")); // name表示当前是多选还是单选
  // $(`.main-content .exercise`).html('').append($newQues)

  if (!$('.question-part')) {
    $('.main-content .exercise').append($newQues);
  } else {
    $('.question-part').remove();
    $('.answer-part').remove();
    $('.main-content .exercise').append($newQues);
  }

  if (name == 'single') {
    // 选择答案，切换样式,显示解析
    $('.choice-list').on('click', 'li input', getAnalysis);
  } else {
    // 提示 点击下方空白，提供解析
    $('.answer-part').html("<span>\u70B9\u51FB\u6A2A\u7EBF\u4E0B\u65B9\u7A7A\u767D\u533A\u57DF\uFF0C\u663E\u793A\u591A\u9009\u7B54\u6848</span>");
    $('.answer-part').on('click', getAnalysis);
  }

  if (exGroup[index].analysis) {
    // 已经答过题，不能再重复选择，除非重新开始
    $('.exercise input').prop('disabled', true);
    var _exGroup$index$analys = exGroup[index].analysis,
        state = _exGroup$index$analys.state,
        content = _exGroup$index$analys.content,
        ansChar = _exGroup$index$analys.ansChar,
        stuChar = _exGroup$index$analys.stuChar;
    var $newAnalysis = $("<p class=\"ans ".concat(state[0], "\">").concat(state[1], "</p>\n        <p>\u8003\u751F\u7B54\u6848\uFF1A<span class=\"answer ").concat(state[0], "\">").concat(stuChar, "</span></p>\n        <p>\u6B63\u786E\u7B54\u6848\uFF1A<span class=\"correct\">").concat(ansChar, "</span></p>\n        <p>\u7B54\u6848\u89E3\u6790\uFF1A<span class=\"analysis\"><pre>").concat(content, "</pre></span></p>")); //如果没有选择答案，考生答案框隐藏

    $('.answer-part').html('').append($newAnalysis);

    if (stuChar == '') {
      $('.answer-part p:nth-child(-n+2)').css('display', 'none');
    } else {
      stuChar.forEach(function (ans) {
        var i = 'ABCD'.indexOf(ans) + 1;
        $(".choice-list li:nth-child(".concat(i, ")")).addClass('active');
        $(".choice-list li:nth-child(".concat(i, ") input")).prop({
          'checked': true,
          'disabled': true
        });
      });
    }
  }
}

function getAnalysis() {
  var i, errorId, re;
  return regeneratorRuntime.async(function getAnalysis$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          $('.exercise input').prop('disabled', true); // console.log('here!');
          //获取当前考生的选择

          i = $('.question-part').data('question');
          errorId = exGroup[i]._id; // 判断正误 

          _context2.next = 5;
          return regeneratorRuntime.awrap(getAjax("/errors/analysis/".concat(errorId), 'get'));

        case 5:
          re = _context2.sent;
          createAnalysis(re);

        case 7:
        case "end":
          return _context2.stop();
      }
    }
  });
}

function createAnalysis(data) {
  var info = data.data;
  var standAns = info.answer.sort();
  var ansStr = standAns.join('');
  var state = ['wrong', '答错了'];
  var stuAns = []; // 修改样式需要获取index

  var target = $('.question-part').attr('id');
  var index = $('.question-part').attr('id').split('-')[1]; // console.log(ansStr);
  // 首先判断是否有答案

  var choice = $(".choice-list input:checked");
  $(".choice-list input:checked").parents('li').addClass('active'); // 获取解析，默认样式为wrong

  $(".tag.".concat(target, " .ans")).attr('class', 'ans wrong');

  if (choice.length > 0) {
    // 有答案
    stuAns = getAnswer(); // console.log(ans,ansStr);
    // 比较答案

    if (stuAns == ansStr) {
      // 答案正确
      // 修改答题卡样式、修改state
      state = ['correct', '答对了'];
      $(".tag.".concat(target, " .ans")).attr('class', 'ans correct');
    }
  } //显示解析
  // //根据考生答案，为input设定选中状态和样式


  var character = ['A', 'B', 'C', 'D'];

  var stuChar = _toConsumableArray(stuAns).map(function (i) {
    return character[i];
  });

  var ansChar = standAns.map(function (i) {
    return character[i];
  }); //根据考生答案，为input设定选中状态和样式
  // $newQues.find(`.choice-list li:nth-child(${}) input`).

  var $newAnalysis = $("<p class=\"ans ".concat(state[0], "\">").concat(state[1], "</p>\n        <p>\u8003\u751F\u7B54\u6848\uFF1A<span class=\"answer ").concat(state[0], "\">").concat(stuChar, "</span></p>\n        <p>\u6B63\u786E\u7B54\u6848\uFF1A<span class=\"correct\">").concat(ansChar, "</span></p>\n        <p>\u7B54\u6848\u89E3\u6790\uFF1A<span class=\"analysis\"><pre>").concat(info.analysis, "</pre></span></p>")); //如果没有选择答案，考生答案框隐藏

  $('.answer-part').html('').append($newAnalysis);

  if (stuChar == '') {
    $('.answer-part p:nth-child(-n+2)').css('display', 'none');
  } else {
    $('.answer-part p:nth-child(-n+2)').css('display', 'block');
  } //当前解析已获取，回到之前的解析，解析还在，需要将解析传入exGroup数组


  exGroup[index]['analysis'] = {
    content: info.analysis,
    state: state,
    stuChar: stuChar,
    ansChar: ansChar
  }; // // 取消选择,针对多选，为空，修改答题框样式，
  // if (stuChar=='') {
  //     $(`.tag.${target} .ans`).addClass('todo').removeClass('done')
  //     // //答题进度-1
  //     // renderProgress(-1)
  // }

  renderProgress();
}

$('.changeExercise').on('click', 'span', function (e) {
  var i = Number($(".question-part .title").text().match(/^.+(?=\.)/));

  if ($(this).hasClass('nextBtn')) {
    // 切换下一题
    if (curEx + 1 >= exGroup.length) {
      console.log('没有下一题');
    } else {
      // console.log(single, multi);
      if (exGroup[curEx].type != exGroup[curEx + 1].type) {
        // 当前是多选
        i = 0;
      }

      curEx++; // createInfo(curEx)
      // 获取当前的i
      // console.log(curEx);

      createQuestion(curEx, i + 1);
    }
  } else {
    // if($(this))
    // 获取当前习题的题号，即第几题
    if (curEx - 1 < 0) {
      console.log('没有上一题');
    } else {
      if (exGroup[curEx].type != exGroup[curEx - 1].type) {
        // 当前是多选
        i = single + 1;
      }

      curEx--;
      createQuestion(curEx, i - 1);
    }
  }
});
$('.analysis-box').on('click', 'span', function _callee2(e) {
  var i, type;
  return regeneratorRuntime.async(function _callee2$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          // console.log($(this));
          if ($(this).hasClass('showAnalysis')) {
            // 显示解析
            getAnalysis();
          } else {
            // 从数据库删除本错题 
            i = $(".question-part .title").text().match(/^.+(?=\.)/); // console.log(i);
            // 从当前数组删除本错题，重新渲染下一道题
            // tag答题卡需要删除 
            // console.log(curEx);

            exGroup.splice(curEx, 1); // console.log(exGroup.length);
            // 应该直接渲染i的下一道题
            // $(`.question-part`).attr('id')   //single-0   type-(i-1)

            type = $(".question-part").attr('id').split('-')[0];
            renderAnswerCard();

            if (type == 'multi') {
              if (curEx == multi) {
                // 删除的是最后一个元素,显示上一个
                createQuestion(curEx, i - 1);
              } else {
                // 正常，序号显示当前
                createQuestion(curEx, i);
              }

              multi--;
            } else {
              if (curEx == single) {
                // 删除的是最后一个元素,显示上一个
                createQuestion(curEx, i - 1);
              } else {
                // 正常，序号显示当前
                createQuestion(curEx, i);
              }

              single--;
            }

            renderProgress();
          }

        case 1:
        case "end":
          return _context3.stop();
      }
    }
  }, null, this);
});
$('.restart').on('click', function (e) {
  createQuestion(0, 1);
});

function renderProgress() {
  //fn=0,init; fn=1,+1 ; fn=-1,-1
  // 计算当前每道题所占的百分比
  var all = exGroup.length; // console.log(all);

  var radio = 100 / all; // let cur = $('.progress-text').text().split('/')[0]
  //tag-box 有done标签的元素个数

  var cur = 0; // console.log($('.tag-box .ans'));

  $('.tag-box .ans').each(function () {
    if ($(this).hasClass('correct') || $(this).hasClass('wrong')) {
      cur++;
    }
  });
  $('.progress-bar span').animate({
    width: "".concat(cur * radio, "px")
  });
  $('.progress-text').text("".concat(cur, " / ").concat(all));
}

function getAnswer() {
  // 获取答应的answers，转化成字符串，修改样式，返回
  var inputs = $('.exercise input:checked');
  var stuAns = ''; // 已选择，需要对答案进行判断

  inputs.each(function (i) {
    stuAns += $(this).val();
  }); // console.log(stuAns);

  return stuAns;
}

function getAjax(url, type) {
  return $.ajax({
    url: url,
    type: type
  });
}