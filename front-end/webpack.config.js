//引入路径模块
let path = require('path')
let HtmlWebpackPlugin = require('html-webpack-plugin')
let MiniCssExtractPlugin = require('mini-css-extract-plugin')
let webpack = require('webpack')

let arr = ['index', 'answers', 'collections', 'errors', 'login', 'reg', 'tests-basic-info', 'tests', 'exercises', 'tests-end']
// 函数返回entry地址
function entryList() {
    let obj = {}
    arr.forEach(name => {
        obj[name] = './src/js/' + name + '.js'
    })
    return obj;
}

function htmlPlugin() {
    let pluginArr = []
    arr.forEach(name => {
        //声明要使用的插件对象
        pluginArr.push(new HtmlWebpackPlugin({
            template: `./src/html/${name}.html`, //即将打包的html文件路径，参照项目根目录指定路径
            filename: `./html/${name}.html`, //打包后的资源 保存到输出文件夹中的哪个具体路径，参照输出文件夹指定路径 /dist
            chunks: [name] //要关联的主js文件，允许引入多个
        }))
    })
    return pluginArr;
}
//配置打包信息并将打包信息暴露给系统
module.exports = {
    mode: 'development', //配置打包模式，development：开发模式，不会对代码进行压缩混淆，
    //production：生产模式
    entry: {
        // vendors:['font-awesome-loader'],
        ...entryList()
    },
    // { //要打包的资源
    // index: './src/js/index.js' //参照根目录查找打包资源
    // },
    output: {
        path: path.resolve(__dirname, 'dist'), //__dirname获取当前项目的绝对路径,两根下划线
        //_dirname + dist
        filename: 'js/[name].js' //[name]获取源文件名称
    },
    plugins: [
        ...htmlPlugin(),
        new MiniCssExtractPlugin({
            filename: './css/[name].css', //基于dist文件夹的相对地址
        }),
        new webpack.ProvidePlugin({
            "$": "jquery"
        })
    ],
    module: {
        rules: [{
                //打包css规则
                test: /\.css$/i, //编写正则，用于确定要打包的资源
                use: [MiniCssExtractPlugin.loader, 'css-loader'], //需要借助的插件
            },
            {
                //scss规则
                test: /\.scss$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
            }, //scss规则
            {
                test: /((\.jpg)|(.\png)|(.\gif)|(.\jpeg)|(.\svg)|(.\psd)|(.\tif)|(.\bmp)|(.\webp))$/i,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 1024 * 10, //将10kb一下的图片自动转为base64字符串放在页面中
                        outputPath: './image/', //配置打包后的图片存放在输出文件夹/dist中的文件
                        esModule: false //用于解决兼容问题
                    }
                }
            },
            //配置html图片的打包规则配置
            {
                test: /.\html$/i,
                use: ['html-withimg-loader']
            },

            // font-awesome
            {
                test: /\.(eot|svg|ttf|woff|woff2)\w*/,
                loader: 'url-loader',
                // use: {
                //     options: {
                //         limit: 1024 * 10, //将10kb一下的图片自动转为base64字符串放在页面中
                //     }
                // } 
            },
        ],
    },
    devServer: {
        port: 8207, //服务器端口
        open: true, //启动服务器时自动打开一个页面
        openPage: './html/index.html', //参照dist路径
        hot: true, //热部署，更新代码后，服务器自动进行打包
        proxy: { //代理服务器，
            "/": {
                // target: "http://localhost:7820"//如果当前webpack服务器上无法查找资源，会去target对应的服务器找
                target: "http://localhost:17820" //如果当前webpack服务器上无法查找资源，会去target对应的服务器找
            },

        }
    }

}