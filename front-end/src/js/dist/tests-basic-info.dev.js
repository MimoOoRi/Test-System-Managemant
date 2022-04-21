"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _moment = _interopRequireDefault(require("moment"));

var Util = _interopRequireWildcard(require("./util"));

var Loading = _interopRequireWildcard(require("./loading"));

require("./analyzeToken");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

//引入第三方资源，地址基于node_module
require('jquery/dist/jquery.min');

require('bootstrap/dist/css/bootstrap.min.css');

require('bootstrap/dist/js/bootstrap.min.js');

require('../css/tests-basic-info.css');

require('../css/modal.css');

var testId = location.search.substring(1).split('&')[0].split('=')[1]; // 获取学生id

var stuId = location.search.substring(1).split('&')[1].split('=')[1];
var typeId = location.search.substring(1).split('&')[2].split('=')[1];
$(function () {
  // 显示loading页面
  $('#loading-mask').fadeIn(10); // 获取search的testId信息
  // console.log(testId,stuId);

  $.ajax({
    url: "/tests/".concat(testId, "/").concat(stuId, "/").concat(typeId),
    type: 'POST',
    success: function success(data) {
      console.log(data);
      renderTestInfo(data.data, data.info);
      setTimeout(function () {
        clearInterval(Loading.timer);
        $('#loading-mask').fadeOut(200);
      }, 600);
    }
  });
});

function renderTestInfo(info, test) {
  // console.log(Util.getTestSchedule);
  var schedule = Util.getTestSchedule(test);
  var $newInfo = $("<h2 class=\"title\">".concat(info[0], "</h2>\n    <div class=\"test-info\">\n        <!-- <span class=\"sub-title\">\u8BD5\u5377\u4FE1\u606F</span> -->\n        <p>\u8003\u8BD5\u7C7B\u578B\uFF1A<span>").concat(info[1], "</span></p>\n        <p>\u8003\u8BD5\u65F6\u95F4\uFF1A<span>").concat(schedule, "</span></p>\n        <p>\u7B54\u5377\u65F6\u95F4\uFF1A<span>").concat(info[2], "</span></p>\n        <p>\u8003\u8BD5\u65B9\u5F0F\uFF1A<span>\u7EBF\u4E0A</span></p>\n    </div>\n    <div class=\"stu-info\">\n        <!-- <span class=\"sub-title\">\u8003\u751F\u4FE1\u606F</span> -->\n        <p>\u59D3\u540D\uFF1A<span>").concat(info[3], "</span></p>\n        <p>\u8BC1\u4EF6\u53F7\u7801\uFF1A<span>129387510238418741023985</span></p>\n    </div>"));
  $('.btn-box').before($newInfo);
}

$('.btn-box').on('click', 'button', function (e) {
  if ($(this).hasClass('back')) {
    // 返回上一步,即试题页面
    history.back();
  } else {
    // 进入考试页面
    location.href = "exercises.html?test=".concat(testId, "&stu=").concat(stuId, "&type=").concat(typeId); // location.href = `exercises.html?test=625634c71a34000097001cc7&stu=6257cfdc86104b27f3229fb8&type=625633891a34000097001cc5`;
  }
});