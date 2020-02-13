const { CleanWebpackPlugin } = require('clean-webpack-plugin'); // installed via npm
const HtmlWebpackPlugin = require('html-webpack-plugin'); // installed via npm
const webpack = require('webpack'); // to access built-in plugins
// const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require('path');

console.log("__dirname ===>", __dirname);

module.exports = {
  // module: {
  //   rules: [
  //     {
  //       test: /\.m?js$/,
  //       exclude: /(node_modules|bower_components)/,
  //       use: {
  //         loader: 'babel-loader',
  //         options: {
  //           presets: ['@babel/preset-env']
  //         }
  //       }
  //     }
  //   ]
  // },
  entry: {
    main: './js/game_3.js'
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: "[name].js"
    // filename: "[name].[hash].js"
  },
  plugins: [
    // new webpack.ProgressPlugin(),
    new CleanWebpackPlugin(),
    // new MiniCssExtractPlugin({
    //   filename: "[name].[hash].css",
    // }),
    new HtmlWebpackPlugin({
      // html模板文件(在文件中写好title、meta等)
      template: "src/temp.html",
      // 输出的路径(包含文件名)
      filename: "./demo.html",
      //自动插入js脚本
      // true body head false 默认为true:script标签位于html文件的 body 底部
      inject: true,
      // chunks主要用于多入口文件，当你有多个入口文件，那就回编译后生成多个打包后的文件，那么chunks 就能选择你要使用那些js文件
      chunks: ["index"]
      // 压缩html
      // minify: {
      //   // 移除注释
      //   removeComments: true,
      //   // 不要留下任何空格
      //   collapseWhitespace: true,
      //   // 当值匹配默认值时删除属性
      //   removeRedundantAttributes: true,
      //   // 使用短的doctype替代doctype
      //   useShortDoctype: true,
      //   // 移除空属性
      //   removeEmptyAttributes: true,
      //   // 从style和link标签中删除type="text/css"
      //   removeStyleLinkTypeAttributes: true,
      //   // 保留单例元素的末尾斜杠。
      //   keepClosingSlash: true,
      //   // 在脚本元素和事件属性中缩小JavaScript(使用UglifyJS)
      //   minifyJS: true,
      //   // 缩小CSS样式元素和样式属性
      //   minifyCSS: true,
      //   // 在各种属性中缩小url
      //   minifyURLs: true
      // }
    })
  ]
}
