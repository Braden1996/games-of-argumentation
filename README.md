# Argumentation Games - Web Demo
## Introduction
A web-based demonstration of several argumentation games.

For more information regarding the games, please consult their corresponding papers:
- [Grounded Discussion Game](https://users.cs.cf.ac.uk/CaminadaM/publications/simplified_grounded_TAFA.pdf).
- [Preferred Discussion Game](https://users.cs.cf.ac.uk/CaminadaM/publications/preferred-game-JLC.pdf).

## Getting Started
In order to get an instance of the application up and running, our static JavaScript and CSS files first need to be generated. This is because we are using several pre-processors to help make development faster, modular and more compatible.

To making setting up and development easier, we have created several [Gulp](http://gulpjs.com/) tasks to automate many of the tasks associated with our pre-processors etc.

We use [Bower](https://babeljs.io/) to manage all our front-end dependencies.

Both Gulp and Bower are [NodeJS](https://nodejs.org/en/) applications - so be sure to install it before continuing. Once NodeJS has been installed, be sure it is accessible from the command-line (for Windows, make sure Node is added to the `PATH` environment-variable).

NodeJS comes with a handy package manager, allowing us to keep track of all our remaining dependencies. Both Gulp and Bower are required to be installed globally. You can do this by running the following command into your terminal: `npm install bower gulp -g`.

Now, install the remaining local dependencies for this application. This can be done by entering the following command into your terminal: `npm install`
(make sure your terminal directory is set to our application's root directory when installing local dependencies).

Next, we will use Bower to download all of the front-end packages our application is employing. To do this, enter the following command into your terminal: `bower install`
(once again, make sure your terminal directory is set to our application's root directory when installing local dependencies).

Finally, we can now use Gulp to compile all our website's assets into usable static files. This can be done by entering `gulp` into your terminal whilst in our application's root directory.

To run the application, open `./src/index.html` in the browser of your choice.

Other Gulp commands:
- `gulp production`: compile our assets into minified, deployable static files.
- `gulp watch`: automatically, and efficiently, re-compile our assets when a change has been made to our application's source files. (Good for development.)

## File Structure
### Overview
- `srs/assets/js/`: all the JavaScript files of our application. We use [BabelJ(https://babeljs.io/) in order to confidently use the latest version of JavaScript ([ES6](http://es6-features.org/)). We use [Browserify](http://browserify.org/) to modulate our code-base. Our Gulp tasks take care of all the compiling.
- `srs/assets/scss/`: all the [SASS](http://sass-lang.com/) files of our application. Our Gulp tasks take care of all the compiling. We've taken a [BEM](http://getbem.com/introduction/) and [SMACSS](https://smacss.com/) approach to organising our CSS - try to keep this going.

### JavaScript - Overview
- `srs/assets/js/app/`: the body and brain of our application.
- `srs/assets/js/views/`: DOM interaction that isn't necessarily coupled to our app.
- `srs/assets/js/visuals/`: DOM interaction which relate to our CSS modules. This also isn't necessarily coupled to our app.
- `srs/assets/js/main.js`: `require()` everything - quick and simple.

### JavaScript - App
- `srs/assets/js/app/games/`: the actual functionality of our grounded and preferred games. There is a provided `base` game (`srs/assets/js/app/games/base/`) which defines some generic move functionality, event handling and some other neat features.
We've done our best to separate logic from DOM interaction (`srs/assets/js/app/games/*/view.js`).

- `srs/assets/js/app/logic/`: general-purpose argumentation functionality.
- `srs/assets/js/app/util/`: useful utility/miscellaneous functions
- `srs/assets/js/app/views/`: generic app-related DOM interaction
- `srs/assets/js/app/config.js`: easy configuration - including the stylesheet for our graph. This could be separated into SCSS and loaded back in somehow?
- `srs/assets/js/app/main.js`: Kickstart the functionality of our game, i.e. `require()` everything.

Please don't hesitate to let us know if you encounter any issues! 
Just open up a `New issue` in the GitHub repository's [Issue Tracker](https://github.com/Braden1996/grounded-discussion-game/issues).