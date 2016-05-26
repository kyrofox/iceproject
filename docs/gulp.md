# Gulp

This document is meant as a quick overview to what and why [Gulp](http://www.gulpjs.com/).

## Taskrunners

When you start writing a bigger project you get to a point where there are many tasks you are doing. At some point you start splitting your JavaScript into multiple files, you make it more modular. This is awesome! It helps to keep track of things, you divide and conquer your problems. Or you may want to make your CSS files and remove unneded whitespaces from HTML files. Or you may use a CSS preprocessor such as [Stylus](http://stylus-lang.com/). All of these tasks add up. So people created taskrunners to deal with this.

The idea is to have a script run all those things for us. All we do is tell it what to do.

There are several approaches to this. The most popular are Gulp, GRUNT and npm scripts. Here is a good [article on the differences](https://ponyfoo.com/articles/choose-grunt-gulp-or-npm)

## What we want to do

For this project it makes sense to do a few things in particular:
- Minify the JS
- Minify CSS
- Create a ZIP file

That is basically what needs to be done every time a new version is released to the store. Maybe we also want to add testing later but for now think about those tasks.

Basically all we want to do is make things smaller to provide a smaller download for users. It also makes sense to have any resources smaller because it will increase the speed of our extension. It might seem unimportant. But to the perception of a users 100ms can make the difference between an action being perceived as instantaneous or taking some time.

## Using Gulp

Gulp requires [NodeJS](https://nodejs.org/) and the use of a console. If you are on Windows here is a [take on getting a good console](https://gist.github.com/HoverBaum/021cec80d0a095153a439f89fd33695f#a-terminal-on-windows).

To install Gulp run
```
npm install -g gulp
```

Now you can run all taks from the `gulpfile.js`. For example
```
gulp 		//Build the distribution version with minified files.
gulp zip	//Create a ZIP file to upload tot he store.
gulp clean	//Remove things from the dist folder to have a clean start.
```

### Gulp tasks

In Gulp you create "tasks" to be run. They have an *identifier* and a *function* to be run. In general they look like this:
```javascript
gulp.task('identifier', function() {
	gulp.src('src/files', {base: 'src'})
	.pipe(someTask())
	.pipe(gulp.dest('dist/'));
});

//Run with 'gulp identifier'.
```

Lets take a closer look at each line.
```javascript
gulp.src('src/files', {base: 'src'})
```
Here we tell Gulp which files to use for this task. We can also use wildcards to get all files in all subfolder `**/*` also only those with a special extension `**/*.js` or hand an array with files to use.  
The `{base: 'src'}` tells Gulp to output files to `dist/` instead of to `dist/src/`.

```javascript
.pipe(someTask())
```
This tells Gulp to run a certain transformation on all files coming through.

```javascript
.pipe(gulp.dest('dist/'));
```
Finally we tell Gulp to pipe all files to a destination at 'dist', our folder for distribution.
