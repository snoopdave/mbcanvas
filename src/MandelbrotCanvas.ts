/**
 * Copyright (c) 2015 David M. Johnson
 * MIT License
 */

// Mandelbrot viewer based on HTML5 canvas

import DS = require('./Graphics');

export class MandelbrotCanvas extends DS.DrawingSurface {

    private data;
    private colors: DS.ColorTable;
    
    max_iterations: number; // give each point this many attempts to "escape" from the set
    set_size: number;       // count of number of points in last Mandelbrot set computed
    
    constructor( tl: DS.Point, br: DS.Point, canvas ) {
        super( tl, br, canvas );
        this.max_iterations = 500;
        this.init_colors();
    }
    
    init_colors() {
        var stops = []
        stops[0]   = new DS.Color(0,0,0);
        stops[1]   = new DS.Color(50,0,0);
        stops[160] = new DS.Color(255,0,0);
        stops[320] = new DS.Color(255,255,0);
        stops[420] = new DS.Color(0,0,255);
        stops[500] = new DS.Color(0,0,255);
        this.colors = new DS.ColorTable(stops);
    }
    
    /**
     * Draw Mandelbrot set with current view-port settings.
     */
    draw_mandelbrot() {

        var context = this.canvas.getContext("2d");
        var image = context.createImageData(this.canvas.width, this.canvas.height);
        this.data = context.createImageData(this.canvas.width, this.canvas.height);

        this.set_size = 0;
        console.time("create_image");
        
        // loop through all pixels in canvas
        for ( var x=0; x<this.canvas.width; x++) {

            for ( var y=0; y<this.canvas.height; y++) {

                // determine logical coordinates of pixel
                var canvas_point = new DS.Point(x, y);
                var complex = this.canvas_to_logical(canvas_point);

                // determine if point is in Mandelbrot set
                var m = this.mandelbrot(complex, 4, this.max_iterations);

                if (m == 0) {
                    this.set_size++;
                }

                var offset = (x + y * this.canvas.width) * 4;
                var color = this.colors.get(m);
                image.data[offset    ] = color.r; 
                image.data[offset + 1] = color.g;
                image.data[offset + 2] = color.b;
                image.data[offset + 3] = 255;
                
                this.data.data[offset] = m;
            }
        }

        console.timeEnd("create_image");
        context.putImageData(image, 0, 0);
    }
    
    /**
     * Determine if point is in Mandelbrot set, or how close it got to being considered in the set.
     * @param {Point} start The point to be tested.
     * @returns {number} 0 if point is in set or number of iterations before it "escaped"
     */
    mandelbrot( start: DS.Point, limit: number, iterations: number ) {

        var squared = new DS.Point(start.x, start.y);
        var count = 0;
        while ( count++ < iterations ) {

            var x2 = Math.pow(squared.x, 2);
            var y2 = Math.pow(squared.y, 2);

            if ( (x2 + y2) > limit ) { // not in the set 
                return count;
            }

            // square of a complex (x + yi) = (x*x - y*y, 2*x*y)
            var sx = x2 - y2;
            var sy = (2 * squared.x * squared.y);

            // add original point 
            squared.x = sx + start.x;
            squared.y = sy + start.y;
        }

        return 0;
    }

    zoom( center: DS.Point, z: number ) {
        super.zoom( center, z );
        this.draw_mandelbrot();
    }
    
    reset_view() {
        super.reset_view();
        this.draw_mandelbrot();
    }
    
    rotate_colors() {

        console.time("rotate_colors");
        
        var context = this.canvas.getContext("2d");
        var image = context.createImageData(this.canvas.width, this.canvas.height);

        this.colors.rotate();
        
        // loop through all pixels in canvas
        for ( var x=0; x<this.canvas.width; x++) {

            for ( var y=0; y<this.canvas.height; y++) {

                var offset = (x + y * this.canvas.width) * 4;
                var color_index = this.data.data[offset];
                
                var color = this.colors.get(color_index);
                image.data[offset    ] = color.r;
                image.data[offset + 1] = color.g;
                image.data[offset + 2] = color.b;
                image.data[offset + 3] = 255;
            }
        }
        console.timeEnd("rotate_colors");

        context.putImageData(image, 0, 0);
    }
}
