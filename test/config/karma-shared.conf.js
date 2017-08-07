module.exports = function() {
  return {
    basePath: '../../',
    frameworks: ['mocha'],
    reporters: ['progress', 'html'],
    browsers: ['Chrome'],
    autoWatch: true,

    // these are default values anyway
    singleRun: false,
    colors: true,
    
    files : [
      //3rd Party Code
      //'src/app/components/**/*.html',
      
      //App-specific Code
      'target/scripts/lib.js',
      'target/scripts/app.js',
      'target/scripts/appConfig.js',
      'target/scripts/shared.js',

      //Test-Specific Code
      'src/app/node_modules/chai/chai.js',    
      'test/lib/chai-should.js',
      'test/lib/chai-expect.js',
      'src/app/node_modules/sinon/pkg/sinon-1.17.*.js'
    ],
    preprocessors: {
      'target/scripts/app.js': ['coverage'],
      'target/scripts/shared.js': ['coverage']
    },
    reporters: ['progress', 'coverage', 'html'],

    // list of karma plugins
    plugins: [
      'karma-jshint-preprocessor',
      'karma-coverage',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-mocha',      
      'karma-ng-html2js-preprocessor',
      'karma-phantomjs-launcher',
      'karma-htmlfile-reporter'
    ],
    htmlReporter: {
        outputFile: 'test-results/test-result.html',
        // Optional
        pageTitle: 'ARIC 3.0 UI Unit Testing Report',
        subPageTitle: 'UI Nunit Results'
    },
    coverageReporter: {
        type : 'html',
        dir: 'test-results/coverage/' ,
        file: 'coverage-reports.html' 
    }
  }
};
