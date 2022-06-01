const Dotenv = require('dotenv-webpack')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

module.exports = {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  devServer: {
    hot: true,
    open: false,
    historyApiFallback: true,
  },
  plugins: [new Dotenv()],
  resolve: {
    plugins: [new TsconfigPathsPlugin()],
  },
}
