//引入第三方资源，地址基于node_module
require('jquery/dist/jquery.min')

let timer;
$(function () {
    let str = 'hello world!' 
    let i = 0;
    timer = setInterval(function () {
        if (i != str.length+1) {
            $('.animation_text').text(str.substring(0, i)+'_');
            i++;
        } else {
            $('.animation_text').text(str.substring(0, i));
            i = 0
        }
    }, 80) 
})
export {
    timer
};