# mbcanvas

This is a simple [Mandelbrot Set](https://en.wikipedia.org/wiki/Mandelbrot_set) viewer written in [Typescript](http://www.typescriptlang.org/Tutorial) and using the [HTML5 Canvas](http://www.w3.org/TR/2dcontext/). The viewer allows you to view the  set and to zoom in, zoom out and rotate the color-table. Points that are determined to be in the set are shown in black and other points are colored based on the number of times they were squared before "escaping" the set.

You can play with the viewer here: [http://rollerweblogger.org/mbcanvas/](http://rollerweblogger.org/mbcanvas/) and if you want to hack around with the source code the follow the instructions below.

![Screenshot](https://raw.githubusercontent.com/snoopdave/mbcanvas/master/screenshot.png)

# How to build mbcanvas locally

The instructions explain how to get setup to build and run mbcanvas locally.

## Pre-requisites

To build and run mbcanvas, you will need a computer with Node and npm installed, also you'll need a web-browser. 

## Getting the code

Clone this Github repo.

	git clone https://github.com/snoopdave/mbcanvas.git
	
## Build and run	
	
Open up a terminal window and cd into the mbcanvas directory. 

First, install dependencies:

	npm install
	
To start the development server:

	npm start
	
This will compile the TypeScript code and start a development server. The application will automatically reload when you make changes to the source code.

To create a production build:

        npm run build

## Using the Mandelbrot explorer

1. Start the development server with `npm start` and open [http://localhost:8080](http://localhost:8080) in your browser. The build command above will serve the production bundle from the `dist` directory if you prefer to host it yourself.
2. Hover over the canvas to see the coordinates, iteration count, and zoom level update in the stats panel.
3. Use your mouse wheel or trackpad scroll to zoom in and out. Hold the left mouse button and drag to pan around the set.
4. Adjust the *Iteration Depth* slider in the control sidebar to reveal more or fewer fractal details. Higher values render more intricate boundaries at the cost of a slightly longer render time.
5. Switch between the available color palettes with the *Palette* dropdown. Enable *Auto Rotate* to cycle through colors automatically, or use the rotate buttons for manual control.
6. Toggle *Auto Color Reset* if you want the palette to reset after each zoom. You can also enable the optional *Orbit Trap* shading for a different look at the set.

The fractal redraws immediately as you tweak the controls, so experiment with different combinations to explore new regions of the Mandelbrot set.
