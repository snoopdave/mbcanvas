/**
 * Copyright (c) 2015 David M. Johnson
 * MIT License
 */

// mbcanvas - Mandelbrot viewer based on HTML5 canvas


class MandelbrotCanvas {

    private canvas;
    private data;
    private colors: ColorTable;
    
    // view-port defined by top-right and bottom left logical coordinates

    tl: Point;        // top-left
    br: Point;        // bottom-right
    xscale: number;   // x scale for logical to/from canvas coordinates
    yscale: number;   // y scale for logical to/from canvas coordinates
    width: number;    // logical width
    height: number;   // logical height

    tl0: Point;       // initial tl value
    br0: Point;       // initial br value

    max_iterations: number; // give each point this many attempts to "escape" from the set
    set_size: number;       // count of number of points in last Mandelbrot set computed
    
    rotated: number;
   
    
    constructor( tl: Point, br: Point, canvas ) {
        this.max_iterations = 500;
        this.tl = tl;
        this.br = br; 
        this.tl0 = tl;
        this.br0 = br; 
        this.canvas = canvas;
        this.rotated = 0;
        
        this.init_viewport();
        this.init_colors();
    }
    
    init_colors() {
        var stops = []
        stops[0]   = new Color(0,0,0);
        stops[1]   = new Color(50,0,0);
        stops[160] = new Color(255,0,0);
        stops[320] = new Color(255,255,0);
        stops[420] = new Color(0,0,255);
        stops[500] = new Color(0,0,255);
        this.colors = new ColorTable(stops);
    }

    init_viewport() {
        this.width  = this.br.x - this.tl.x;
        this.height = this.tl.y - this.br.y;
        this.xscale = this.canvas.width / (this.br.x - this.tl.x);
        this.yscale = this.canvas.height / (this.tl.y - this.br.y);
    }
    
    /**
     * Draw Mandelbrot set with current view-port settings.
     */
    draw_mandelbrot() {

        var context = this.canvas.getContext("2d");
        var image = context.createImageData(this.canvas.width, this.canvas.height);
        this.data = context.createImageData(this.canvas.width, this.canvas.height);

        this.set_size = 0;

        // loop through all pixels in canvas
        for ( var x=0; x<this.canvas.width; x++) {

            for ( var y=0; y<this.canvas.height; y++) {

                // determine logical coordinates of pixel
                var canvas_point = new Point(x, y);
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
        
        context.putImageData(image, 0, 0);
    }
    
    /**
     * Determine if point is in Mandelbrot set, or how close it got to being considered in the set.
     * @param {Point} start The point to be tested.
     * @returns {number} 0 if point is in set or number of iterations before it "escaped"
     */
    mandelbrot( start: Point, limit: number, iterations: number ) {

        var squared = new Point(start.x, start.y);
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

    logical_to_canvas( lp: Point ) {
        return new Point(
            this.xscale*(lp.x - this.tl.x),
            (this.canvas.height) - this.yscale*(lp.y - this.br.y));
    }

    canvas_to_logical( cp: Point ) {
        return new Point(
            cp.x / this.xscale + this.tl.x,
            (this.tl.y - this.br.y) - (cp.y / this.yscale - this.br.y)
        );
    }

    zoom_in( z: number ) {
        var center = new Point( this.br.x - this.width/2, this.tl.y - this.height/2 );
        this.zoom( center, z );
    }

    zoom_out( z: number ) {
        var center = new Point( this.br.x - this.width/2, this.tl.y - this.height/2 );
        this.zoom( center, z );
    }

    zoom( center: Point, z: number ) {
        var dx = this.width * z;
        var dy = this.height * z;
        this.tl = new Point( center.x - this.width/2 + dx, center.y + this.height/2 - dy );
        this.br = new Point( center.x + this.width/2 - dx, center.y - this.height/2 + dy );
        
        this.init_viewport();
        this.draw_mandelbrot();
    }

    reset_view() {
        this.tl = this.tl0;
        this.br = this.br0;
        this.init_viewport();
        this.draw_mandelbrot();
    }
    
    rotate_colors() {
        
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

        context.putImageData(image, 0, 0);
    }
}


class Point {
    x: number;
    y: number;
    constructor( x: number, y: number ) {
        this.x = x;
        this.y = y;
    }
}


class ColorTable {
    private colors: Array<Color>;

    /**
     * @param stops Sparse array of color stops from which color table will be interpolated.
     */
    constructor( stops: Array<Color> ) { 
        this.colors = [];
        var previous = -1;
        for ( var index in stops ) {
            
            var i = parseInt(index); 
            var this_stop = stops[i];
            
            if ( previous >= 0 ) {
                console.log("Generating " + previous + " to " + i);
                var prev_stop = stops[previous];
                
                var slope_r = (this_stop.r - prev_stop.r) / (i - previous);
                var slope_g = (this_stop.g - prev_stop.g) / (i - previous);
                var slope_b = (this_stop.b - prev_stop.b) / (i - previous);
                
                for ( var j=previous; j<i; j++ ) {
                    this.colors[j] = new Color(
                        -slope_r*(previous - j) + stops[previous].r,
                        -slope_g*(previous - j) + stops[previous].g,
                        -slope_b*(previous - j) + stops[previous].b);
                }
                
            } else {
                this.colors[i] = stops[i];
            }
            previous = i;
        }
    }
    
    get( i: number ) {
        var color = this.colors[i];
        if (color) {
            return color;
        } else {
            //console.error("Error returning color for index = " + i);
            return new Color(0,0,0);
        }
    }
    
    rotate() {
        var first = this.colors[1];
        for ( var i=0; i<this.colors.length; i++ ) {
            var new_color;
            if ( i == 0 ) { // first color is the mandelbrot color, don't rotate
                continue;
                
            } else if ( i == this.colors.length - 1) {
                new_color = first; // wrap around
                
            } else {
                new_color = this.colors[ i + 1 ];
            }
            this.colors[i].r = new_color.r;
            this.colors[i].g = new_color.g;
            this.colors[i].b = new_color.b;
        } 
    }
}


class Color {
    r: number;
    g: number;
    b: number;
    constructor( r: number, g: number, b: number  ) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
}


