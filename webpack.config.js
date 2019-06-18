const webpack = require('webpack');
const path = require('path');

const config = {
  mode: 'developement',
  entry: path.join(__dirname, 'src/js/app.js'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  devServer: {
    publicPath: '/dist',
    port: 3000,
    //disableHostCheck: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [ 
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'sass-loader' }
        ]
      },
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        exclude: /node_modules/,
        use: [
          { loader: 'raw-loader' },
          { loader: 'glslify-loader' }
        ]
      }
    ]
  },
  mode: 'development'
};

module.exports = config;