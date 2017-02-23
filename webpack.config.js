var glob = require('glob');

module.exports = {
  // entry: './www/js/app.js',
  entry: {
    'wca': glob.sync('./www/**/*.js')
  },

  output: {
    path: './www/dist',
    filename: 'bundle.js'
  }
};