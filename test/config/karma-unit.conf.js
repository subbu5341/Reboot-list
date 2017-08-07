var sharedConfig = require('./karma-shared.conf');

module.exports = function(config) {
  var conf = sharedConfig();

  conf.files = conf.files.concat([
    //extra testing code
    'src/app/bower_components/angular-mocks/angular-mocks.js',

    //mocha config
    'test/config/mocha.conf.js',

    //mock Data
    'test/unit-test/mockData/*.js',

    //test files
    'test/unit-test/**/*.test.js'
  ]);

  config.set(conf);
};
