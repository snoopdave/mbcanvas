/**
 * Copyright (c) 2015 David M. Johnson
 * MIT License
 */

// mbcanvas - Mandelbrot viewer based on HTML5 canvas


class MandelbrotCanvas {

    private canvas;
    zoom_out_button: ZoomOutButton;
    
    // view-port defined by top-right and bottom left logical coordinates

    tl: Point;        // top-left
    br: Point;        // bottom-right
    xscale: number;   // x scale for logical to/from canvas coordinates
    yscale: number;   // y scale for logical to/from canvas coordinates
    width: number;    // logical width
    height: number;   // logical height

    tl0: Point;       // initial tl value
    br0: Point;       // initial br value

    set_size: number; // number of points in Mandelbrot set
    
    constructor( tl: Point, br: Point, canvas ) {
        this.tl = tl;
        this.br = br; 
        this.tl0 = tl;
        this.br0 = br; 
        this.canvas = canvas;
        this.init_viewport();
        this.zoom_out_button = new ZoomOutButton(canvas);
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

        this.set_size = 0;

        // loop through all pixels in canvas
        for ( var x=0; x<this.canvas.width; x++) {

            for ( var y=0; y<this.canvas.height; y++) {

                // determine logical coordinates of pixel
                var canvas_point = new Point(x, y);
                var complex = this.canvas_to_logical(canvas_point);

                // determine if point is in Mandelbrot set
                var m = this.mandelbrot(complex, 4, 255);

                if (m == 0) {
                    this.set_size++;
                }

                var offset = (x + y * this.canvas.width) * 4;
                image.data[offset + 0] = (m == 0) ? 255 : m;
                image.data[offset + 1] = m;
                image.data[offset + 2] = m;
                image.data[offset + 3] = 255;
            }
        }
        context.putImageData(image, 0, 0);
        this.zoom_out_button.draw();
    }
    
    /**
     * Determine if point is in Mandelbrot set, or how close it got to being considered in the set.
     * @param {Point} start The point to be tested.
     * @returns {number} 0 if point is in set or number of iterations before it was rules to be out of the set.
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

    zoom_in( center: Point, z: number ) {
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

    reset_zoom() {
        this.tl = this.tl0;
        this.br = this.br0;
        this.init_viewport();
        this.draw_mandelbrot();
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


class ZoomOutButton {
    private canvas;

    // bounding box specified in canvas coordinates
    tl: Point;
    br: Point;
    width: number;
    height: number;

    constructor( canvas ) {
        this.tl = new Point(10,10);
        this.br = new Point(40,40);
        this.width = this.br.x - this.tl.x;
        this.height = this.tl.y - this.br.y;
        this.canvas = canvas;
    }

    draw() {
        var context = this.canvas.getContext("2d");
        context.strokeStyle = "rgb(255,255,255)";
        context.strokeRect( this.tl.x, this.br.y, this.width, this.height );
    }

    is_hit( cp: Point ) {
        // remember with canvas coordinates, y is inverted
        if ( cp.x >= this.tl.x && cp.x <= this.br.x && cp.y >= this.tl.y && cp.y <= this.br.y ) {
            return true;
        }
        return false;
    }
}

