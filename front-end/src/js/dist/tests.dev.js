"use strict";

require("jquery/dist/jquery.min");

require("bootstrap/dist/css/bootstrap.min.css");

require("bootstrap/dist/js/bootstrap.min.js");

require("../css/header-footer.css");

require("../css/tests.css");

require("../css/modal.css");

//引入第三方资源，地址基于node_module
// import './index.js'
var type = Number($('#typeSelector').val());
$(function _callee() {
  var getRe, points, testRe, tests;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          $('.score').val('3'); //从数据库获取信息

          _context.next = 3;
          return regeneratorRuntime.awrap(getAjax("/points", 'get'));

        case 3:
          getRe = _context.sent;
          points = getRe.data; // 从数据库获取试卷信息

          _context.next = 7;
          return regeneratorRuntime.awrap(getAjax("/tests", 'get'));

        case 7:
          testRe = _context.sent;
          tests = testRe.data;
          console.log(tests); // console.log(points);

          renderTest(tests);
          renderPoint(points);

        case 12:
        case "end":
          return _context.stop();
      }
    }
  });
});

function renderPoint(points) {
  points.forEach(function (point, i) {
    // let $newOption =
    //     $(`
    //     <div>
    //         <input type="checkbox" name="points" id=${point._id}>
    //         <label for="${point._id}">${point.knowledge}</label>
    //     </div>
    // `)
    var $newOption = $("\n            <option value=\"".concat(point._id, "\">").concat(point.knowledge, "</option>\n        "));
    $('#points').append($newOption);
  });
}

function renderTest(tests) {
  tests.forEach(function (test, i) {
    var $newOption = $("\n            <div>\n                <input type=\"checkbox\" name=\"tests\" id=".concat(test._id, ">\n                <label for=\"").concat(test._id, "\">").concat(test.title, "</label>\n            </div>\n        "));
    $('#tests').append($newOption);
  });
} // console.log(type);


$('select').change(function () {
  type = Number($('#typeSelector').val());

  if (type == 1) {
    $('input.type').prop('type', 'checkbox');
    $('.score').val('5');
  } else {
    $('input.type').prop('type', 'radio');
    $('.score').val('3');
  }
});
var exercise = {};
$('.submit').on('click', function _callee2() {
  var answer, checked, topics, options, analysis, score, pointId, tests, re, exIds, exInfo, addExsRe;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          answer = [];
          checked = $('#options input:checked'); // console.log(checked);

          checked.each(function () {
            answer.push(Number($(this).val()));
          }); // console.log(answer);

          topics = $('.topics').val();
          options = [];
          $('input.option-text').each(function () {
            options.push($(this).val());
          });
          analysis = $('.analysis').val();
          score = Number($('input.score').val()); //绑定知识点

          pointId = $('#points').val(); // $('#points').val()
          // $('input[name="points"]:checked').each(function () {
          //     // options.push($(this).attr('value'))
          //     // console.log($(this).next().val());
          //     // console.log($(this).attr('id'));
          //     pointId.push($(this).attr('id'))
          // })
          //绑定试卷

          tests = [];
          $('input[name="tests"]:checked').each(function () {
            // options.push($(this).attr('value'))
            // console.log($(this).next().val());
            // console.log($(this).attr('id'));
            tests.push($(this).attr('id'));
          }); // 储存所有信息到JSON

          exercise = {
            type: type,
            topics: topics,
            options: options,
            answer: answer,
            analysis: analysis,
            score: score,
            pointId: pointId
          };
          console.log(exercise);
          _context2.next = 15;
          return regeneratorRuntime.awrap(sendAjax("/exercises/submit", 'post', exercise));

        case 15:
          re = _context2.sent;
          console.log(re); //将返回的习题id传给添加进目标试卷

          exIds = re.data._id;
          console.log(tests, exIds);
          console.log(exIds);
          exInfo = {
            exIds: exIds,
            tests: tests
          };
          _context2.next = 23;
          return regeneratorRuntime.awrap(getAjax("/tests/addExs/".concat(JSON.stringify(exInfo)), 'patch'));

        case 23:
          addExsRe = _context2.sent;
          console.log(addExsRe);
          $('form')[0].reset();

        case 26:
        case "end":
          return _context2.stop();
      }
    }
  });
});

function sendAjax(url, type, data) {
  console.log(data);
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