const webpack = require('webpack');

const config = {
  entry: './src/js/app.js',
  output: {
    path: `${__dirname}/dist`,
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [ 
          { loader: 'style-loader' },
          { loader: 'css-loader' } 
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