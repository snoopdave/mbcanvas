# mbcanvas

This is a simple [Mandelbrot Set](https://en.wikipedia.org/wiki/Mandelbrot_set) viewer written in Typescript with HTML5 canvas. The viewer allows you to view the  set and to zoom in, zoom out and rotate the color-table. Points that are determined to be in the set are shown in black and other points are colored based on the number of times they were squared before "escaping" the set.

## Pre-requisites

To build and run mbcanvas, you will need a computer with Node, Npm and Grunt installed, also you'll need a web-browser. 

## Getting the code

Clone this Github repo.

	git clone https://github.com/snoopdave/mbcanvas.git
	
## Build and run	
	
Open up a terminal window and cd into the mbcanvas directory. 

First, compile the Typescript code into JavaScript:

	grunt typescript
	
Next, let grunt start a web-server and run mbcanvas in your web-browser.

	grunt
	
Until you stop grunt with control-c, it will watch the Mandelbrot.ts file and will automatically recompile the JavaScript if you change the Typescript code.

(screenshot.png)