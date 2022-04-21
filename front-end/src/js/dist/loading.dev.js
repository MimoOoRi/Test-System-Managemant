"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.timer = void 0;

//引入第三方资源，地址基于node_module
require('jquery/dist/jquery.min');

var timer;
exports.timer = timer;
$(function () {
  var str = 'hello world!';
  var i = 0;
  exports.timer = timer = setInterval(function () {
    if (i != str.length + 1) {
      $('.animation_text').text(str.substring(0, i) + '_');
      i++;
    } else {
      $('.animation_text').text(str.substring(0, i));
      i = 0;
    }
  }, 80);
});