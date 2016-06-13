# Grounded Discussion Game - Web Demo
## Introduction
A web-based demonstration of Martin Caminada's Grounded Discussion Game.

For more information regarding the game, please consult the paper (found here: https://users.cs.cf.ac.uk/CaminadaM/publications/simplified_grounded_TAFA.pdf).

## Getting Started
In order to get an instance of the application up and running, our static Javascript and CSS files first need to be generated. This is because we are using several pre-processors to help make development faster, future-proof and more modular.

I have created several [Gulp](http://gulpjs.com/) tasks which can compile all the application's assets in a single command. To set up Gulp, [Node](https://nodejs.org/en/) must first be installed and accessible from the command-line (for Windows, make sure Node is added to the `PATH` environment-variable).

Once Node has been installed, we can install all the development dependecies simply by entering `npm install` whilst in the application's root directory - should contain `package.json`.

However, Gulp and [Bower](https://babeljs.io/) are required to be accessible from the command-line. To do this easily, simply install them both globally by running the following command: `npm install bower gulp -g`.

Next, we need to download all the third-party packages we are employing. As we use Bower to manage these, they can all be installed easily by entering `bower init` whilst in the application's root directory - should contain `bower.json`.

Finally, we can use Gulp to compile all our assets. This can be done by entering `gulp` in the application's root directory - should contain `gulpfile.js/`.

To run the application, open `src/index.html` in the browser of your choice.

Please don't hesitate to let me know if you encounter any issues! 
Just open up a `New issue` in the GitHub repository's [Issue Tracker](https://github.com/Braden1996/grounded-discussion-game/issues).

## Todo List
1. Get workflow ([Gulp](http://gulpjs.com/) with [SASS](http://sass-lang.com/), [Browserify](http://browserify.org/) and [Babel](https://babeljs.io/)) up and running. :white_check_mark:
2. Setup a brief outline of the project's file-structure/architecture. :white_check_mark:
3. Discover and play about with a decent graphing library. :white_check_mark:
4. Create, if needed, some handy utility functions that will help us to quickly/easily interface between the Argumentation Framework and the graphing library. :red_circle:
5. Implement some trivial means of inputting the Argumentation Framework data into the application. :red_circle:
6. Calculate the grounded labelling for the Argumentation Framework. :red_circle:
7. Create the functionality to calculate the Min-Max numbering for a particular argument. :red_circle:
8. ...
