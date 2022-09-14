const path = require('path')
const webpack = require('webpack')

process.env.GEAKU_IS_BROWSER = '0'

const cjsConfig = {
  mode: 'development',
  target: 'node14',
  devtool: 'source-map',
  entry: {
    cjs: {
      import: './dist/cjs/index',
      library: {
        type: 'commonjs',
      },
    },
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'ge-akeneo-utils-node.[name].js',
  },
  plugins: [new webpack.EnvironmentPlugin(['GEAKU_IS_BROWSER'])],
}

const esmConfig = {
  mode: 'development',
  target: 'node14',
  devtool: 'source-map',
  entry: {
    esm: {
      import: './dist/esm/index',
      library: {
        type: 'module',
      },
    },
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'ge-akeneo-utils-node.[name].js',
  },
  plugins: [new webpack.EnvironmentPlugin(['GEAKU_IS_BROWSER'])],
  experiments: {
    outputModule: true,
  },
}

module.exports = [cjsConfig, esmConfig]
