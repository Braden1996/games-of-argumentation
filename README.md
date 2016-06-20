# Grounded Discussion Game - Web Demo
## Introduction
A web-based demonstration of Martin Caminada's Grounded Discussion Game.

For more information regarding the game, please consult the paper (found here: https://users.cs.cf.ac.uk/CaminadaM/publications/simplified_grounded_TAFA.pdf).

## Getting Started
In order to get an instance of the application up and running, our static Javascript and CSS files first need to be generated. This is because we are using several pre-processors to help make development faster, future-proof and more modular.

I have created several [Gulp](http://gulpjs.com/) tasks which can compile all the application's assets in a single command. To set up Gulp, [Node](https://nodejs.org/en/) must first be installed and accessible from the command-line (for Windows, make sure Node is added to the `PATH` environment-variable).

Once Node has been installed, we can install all the development dependecies simply by entering `npm install` whilst in the application's root directory - should contain `package.json`.

However, Gulp and [Bower](https://babeljs.io/) are required to be accessible from the command-line. To do this easily, simply install them both globally by running the following command: `npm install bower gulp -g`.

Next, we need to download all the third-party packages we are employing. As we use Bower to manage these, they can all be installed easily by entering `bower install` whilst in the application's root directory - should contain `bower.json`.

Finally, we can use Gulp to compile all our assets. This can be done by entering `gulp` in the application's root directory - should contain `gulpfile.js/`.

To run the application, open `src/index.html` in the browser of your choice.

Please don't hesitate to let me know if you encounter any issues! 
Just open up a `New issue` in the GitHub repository's [Issue Tracker](https://github.com/Braden1996/grounded-discussion-game/issues).