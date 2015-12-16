'use strict';

// @todo 
// write a readme file about the chapters

var join = require('path').join;
var yeoman = require('yeoman-generator');
var chalk = require('chalk');

module.exports = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    // setup the test-framework property, Gruntfile template will need this
    this.option('test-framework', {
      desc: 'Test framework to be invoked',
      type: String,
      defaults: 'mocha'
    });
    this.testFramework = this.options['test-framework'];

    this.option('coffee', {
      desc: 'Use CoffeeScript',
      type: Boolean,
      defaults: false
    });
    this.coffee = false;

    this.pkg = require('../package.json');
  },

  askFor: function () {
    var done = this.async();

    // welcome message
    if (!this.options['skip-welcome-message']) {
      this.log(require('yosay')('Let the multimedia journalism begin.'));
      this.log(chalk.magenta(
        'Here are all the things you need to build your BDN app. :) '
      ));
    }

    this.includeSass = true;
    this.includeBootstrap = true;
    this.includeModernizr = true;

    this.includeLibSass = false;
    this.includeRubySass = true;

    this.myDate = new Date();
    this.projectYear = this.myDate.getFullYear();

    done();

    // var prompts = [{
    //   type: 'checkbox',
    //   name: 'features',
    //   message: 'What more would you like?',
    //   choices: [{
    //     name: 'Bootstrap',
    //     value: 'includeBootstrap',
    //     checked: true
    //   },{
    //     name: 'Sass',
    //     value: 'includeSass',
    //     checked: false
    //   },{
    //     name: 'Modernizr',
    //     value: 'includeModernizr',
    //     checked: false
    //   }]
    // }, {
    //   when: function (answers) {
    //     return answers && answers.features &&
    //       answers.features.indexOf('includeSass') !== -1;
    //   },
    //   type: 'confirm',
    //   name: 'libsass',
    //   value: 'includeLibSass',
    //   message: 'Would you like to use libsass? Read up more at \n' +
    //     chalk.green('https://github.com/andrew/node-sass#node-sass'),
    //   default: false
    // }];

    // this.prompt(prompts, function (answers) {
    //   var features = answers.features;

    //   function hasFeature(feat) {
    //     return features && features.indexOf(feat) !== -1;
    //   }

    //   this.includeSass = hasFeature('includeSass');
    //   this.includeBootstrap = hasFeature('includeBootstrap');
    //   this.includeModernizr = hasFeature('includeModernizr');

    //   this.includeLibSass = answers.libsass;
    //   this.includeRubySass = !answers.libsass;

    //   done();
    // }.bind(this));
  },

  gruntfile: function () {
    this.template('Gruntfile.js');
  },

  packageJSON: function () {
    this.template('_package.json', 'package.json');
  },

  git: function () {
    this.template('gitignore', '.gitignore');
    this.copy('gitattributes', '.gitattributes');
  },

  bower: function () {
    var bower = {
      name: this._.slugify(this.appname),
      private: true,
      dependencies: {
        "bootstrap-sass-official": "*",
        "modernizr": "~2.8.3",
        "handlebars": "~1.3.0",
        "bootstrap3-dialog": "*",
        "jquery.lazyload": "~1.9.3",
        "bigvideo.js": "~1.0.9",
        "video.js": "^5.0.0",
        "ba-dotimeout": "*",
        "videojs-youtube": "~2.0.3"
      },
      overrides: {
        "bootstrap-sass": {
          "main": [
              "assets/stylesheets/_bootstrap.scss",
              "assets/fonts/bootstrap/*",
              "assets/javascripts/bootstrap.js"
          ]
        }
      },
      devDependencies: {
        "chai": "~3.4.1",
        "mocha": "~2.3.3"
      }
    };

    this.copy('bowerrc', '.bowerrc');
    this.write('bower.json', JSON.stringify(bower, null, 2));
  },

  jshint: function () {
    this.copy('jshintrc', '.jshintrc');
  },

  editorConfig: function () {
    this.copy('editorconfig', '.editorconfig');
  },

  writeIndex: function () {
    this.indexFile = this.engine(
      this.readFileAsString(join(this.sourceRoot(), 'index.html')),
      this
    );

    // wire Bootstrap plugins
    if (this.includeBootstrap && !this.includeSass) {
      var bs = 'bower_components/bootstrap/js/';

      this.indexFile = this.appendFiles({
        html: this.indexFile,
        fileType: 'js',
        optimizedPath: 'scripts/plugins.js',
        sourceFileList: [
          bs + 'affix.js',
          bs + 'alert.js',
          bs + 'dropdown.js',
          bs + 'tooltip.js',
          bs + 'modal.js',
          bs + 'transition.js',
          bs + 'button.js',
          bs + 'popover.js',
          bs + 'carousel.js',
          bs + 'scrollspy.js',
          bs + 'collapse.js',
          bs + 'tab.js'
        ],
        searchPath: '.'
      });
    }

    this.indexFile = this.appendFiles({
      html: this.indexFile,
      fileType: 'js',
      optimizedPath: 'scripts/main.js',
      sourceFileList: ['scripts/handlebars.helpers.js','scripts/main.js'],
      searchPath: ['app', '.tmp']
    });
  },

  importer: function() {
    this.directory('importer');
  },

  ftpush: function() {
    // Optional FTP grunt plugin
    // Creates empty configuration file.
    this.copy('_ftppass', '.ftppass');
  },

  app: function () {
    this.directory('app');
    this.mkdir('app/scripts');
    this.mkdir('app/styles');
    this.mkdir('app/images');
    this.mkdir('app/data');
    this.copy('chapters.json', 'app/data/chapters.json');
    this.copy('bdnmaine.png', 'app/images/bdnmaine.png');
    this.copy('mainefocus.png', 'app/images/mainefocus.png');
    this.template('README');
    this.write('app/index.html', this.indexFile);
  },

  install: function () {
    this.on('end', function () {
      this.invoke(this.options['test-framework'], {
        options: {
          'skip-message': this.options['skip-install-message'],
          'skip-install': this.options['skip-install'],
          // 'coffee': this.options.coffee
        }
      });

      if (!this.options['skip-install']) {
        this.installDependencies({
          skipMessage: this.options['skip-install-message'],
          skipInstall: this.options['skip-install']
        });
      }
    });
  }
});
