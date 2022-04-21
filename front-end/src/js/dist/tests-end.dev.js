"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var Util = _interopRequireWildcard(require("./util"));

var Loading = _interopRequireWildcard(require("./loading"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

//引入第三方资源，地址基于node_module
require('jquery/dist/jquery.min');

require('bootstrap/dist/css/bootstrap.min.css');

require('bootstrap/dist/js/bootstrap.min.js');

require('../css/tests-end.css');

// 获取试卷信息
var testedId = location.search.split('=')[1];
$(function _callee() {
  var re, stu, testInfo, $newInfo;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // 显示loading页面
          $('#loading-mask').fadeIn(10);
          $('.info-box').html('');
          console.log(testedId);
          _context.next = 5;
          return regeneratorRuntime.awrap(Util.getAjax("/testeds/".concat(testedId), 'get'));

        case 5:
          re = _context.sent;
          stu = re.stuInfo;
          testInfo = re.testEnd;
          console.log(testInfo);
          $newInfo = $("<img src=\"/".concat(stu.avatar.split('//')[1], "\" alt=\"\">\n    <p class=\"stu-name\">").concat(stu.name, "</p>\n    <div class=\"score-info\">\n        <div>\n            <span class=\"info deco-star\">").concat(testInfo.score, "</span>\n            <span>\u5206</span>\n        </div>\n        <p>\u8003\u8BD5\u5DF2\u7ED3\u675F\uFF0C\u611F\u8C22\u4F5C\u7B54\uFF01</p>\n    </div>\n    <div class=\"other-info\">\n        <div class=\"accurate\">\n            <span class=\"info\">").concat(testInfo.accuracy, "</span>\n            <span>\u6B63\u786E\u7387</span>\n        </div>\n        <div class=\"time\">\n            <span class=\"info\">").concat(testInfo.durations, "</span>\n            <span>\u7B54\u9898\u7528\u65F6</span>\n        </div>\n    </div>\n    <div class=\"btn-box\">\n        <button class=\"theme-btn\">\u67E5\u770B\u89E3\u6790</button>\n    </div>"));
          $('.info-box').append($newInfo);
          $('button.theme-btn').on('click', function (e) {
            // 跳转到解析页面
            location.href = "answers.html?first-info=".concat(testedId);
          });
          setTimeout(function () {
            clearInterval(Loading.timer);
            $('#loading-mask').fadeOut(200);
          }, 600);

        case 13:
        case "end":
          return _context.stop();
      }
    }
  });
});