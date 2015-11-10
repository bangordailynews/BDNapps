# The BDN Multimedia App generator

A [Yeoman](http://yeoman.io) generator that scaffolds out a front-end multimedia app with all the BDN Maine defaults.


## Dependencies
- If you don't have [npm](http://nodejs.org) already, `brew install node`
- Install Yo and its required tools: `npm install -g yo bower grunt-cli gulp generator-mocha`
- You need Ruby and SASS installed too. Ruby comes preinstalled on macs. `sudo gem install sass`


## Getting Started

This is a local npm module. See this guide about creating your own [Yeoman Generators](http://yeoman.io/authoring/index.html) if you're stuck.

- From the root of this project, run `npm link`
    -Since you're developing the generator locally, it's not yet available as a global npm module. A global module may be created and symlinked to a local one, using npm.  
    - That will install your project dependencies and symlink a global module to your local file
- Install: `npm install -g generator-bdn`
- Run: `yo bdn`
- Import from the Google docs with php importer/importer.php
    - For some projects, I've set this up with a cron job so they can keep editing docs.
- Run `grunt` for building and `grunt serve` for preview[\*](#grunt-serve-note). `--allow-remote` option for remote access.


#### Third-Party Dependencies

*(HTML/CSS/JS/Images/etc)*

Third-party dependencies are managed with [grunt-wiredep](https://github.com/stephenplusplus/grunt-wiredep). Add new dependencies using **Bower** and then run the **Grunt** task to load them:

```sh
$ bower install --save jquery
$ grunt wiredep
```

This works if the package author has followed the [Bower spec](https://github.com/bower/bower.json-spec). If the files are not automatically added to your source code, check with the package's repo for support and/or file an issue with them to have it updated.

To manually add dependencies, `bower install --save depName` to get the files, then add a `script` or `style` tag to your `index.html` or another appropriate place.

The components are installed in the root of the project at `/bower_components`. To reference them from index.html, use `src="bower_components"` or `src="/bower_components"`. Treat the `bower_components` directory as if it was a sibling to `index.html`.

*Testing Note*: a project checked into source control and later checked out needs to have `bower install` run from the `test` folder as well as from the project root.

#### History

This was forked from the [Yeoman Generator webapp template](https://travis-ci.org/yeoman/generator-webapp).
