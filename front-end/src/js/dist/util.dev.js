"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAjax = exports.getTestSchedule = void 0;

var _moment = _interopRequireDefault(require("moment"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var getTestSchedule = function getTestSchedule(info) {
  if (info.durations != undefined) {
    var minutes = info.durations.slice(0, -2);
    var startTime = info.startTime;

    if (!info.startTime) {
      startTime = info['start-time'];
    }

    var day = startTime.split('/').concat(info.date);
    day[1]--;
    var start = (0, _moment["default"])(day).format("YYYY-MM-DD HH:mm");
    var end = (0, _moment["default"])(day).add(minutes, 'm').format("YYYY-MM-DD HH:mm");
    return "".concat(start, " - ").concat(end);
  }
};

exports.getTestSchedule = getTestSchedule;

var getAjaxAns = function getAjaxAns(url, type, data) {
  // console.log(url, type, data);
  var ansJSON = JSON.stringify(data);
  return $.ajax({
    url: url,
    type: type,
    data: {
      info: ansJSON
    }
  });
};

var getAjax = function getAjax(url, type) {
  return $.ajax({
    url: url,
    type: type
  });
}; // export {getTestSchedule}


exports.getAjax = getAjax;