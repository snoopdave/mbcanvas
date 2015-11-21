/**
 * Copyright (c) 2015 David M. Johnson
 * MIT License
 */

// Drawing surface with logical 2D coordinate system

export class Point {
    x: number;
    y: number;
    constructor( x: number, y: number ) {
        this.x = x;
        this.y = y;
    }
}

export class Color {
    r: number;
    g: number;
    b: number;
    constructor( r: number, g: number, b: number  ) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
}

export class DrawingSurface {

    protected canvas;

    // view-port defined by top-left and bottom left logical coordinates

    tl: Point;        // top-left
    br: Point;        // bottom-right

    tl0: Point;       // initial tl value
    br0: Point;       // initial br value

    xscale: number;   // x scale for logical to/from canvas coordinates
    yscale: number;   // y scale for logical to/from canvas coordinates
    width: number;    // logical width
    height: number;   // logical height

    constructor( tl: Point, br: Point, canvas ) {
        this.tl = tl;
        this.br = br;
        this.tl0 = tl;
        this.br0 = br;
        this.canvas = canvas;
        this.init_viewport();
    }
    
    init_viewport() {
        this.width  = this.br.x - this.tl.x;
        this.height = this.tl.y - this.br.y;
        this.xscale = this.canvas.width / (this.br.x - this.tl.x);
        this.yscale = this.canvas.height / (this.tl.y - this.br.y);
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
    }

    reset_view() {
        this.tl = this.tl0;
        this.br = this.br0;
        this.init_viewport();
    }
}


export class ColorTable {
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
