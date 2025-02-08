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

    constructor(tl: Point, br: Point, canvas: HTMLCanvasElement) {
        this.tl = tl;
        this.br = br;
        this.tl0 = tl;
        this.br0 = br;
        this.canvas = canvas;
        this.width = this.br.x - this.tl.x;
        this.height = this.tl.y - this.br.y;
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

    canvas_to_logical(cp: Point): Point {
        return new Point(
          cp.x / this.xscale + this.tl.x,
          this.br.y + cp.y / this.yscale
        );
    }

    zoom_in( z: number ) {
        const center = new Point( this.br.x - this.width/2, this.tl.y - this.height/2 );
        this.zoom( center, z );
    }

    zoom_out( z: number ) {
        const center = new Point( this.br.x - this.width/2, this.tl.y - this.height/2 );
        this.zoom( center, z );
    }

    zoom(center: Point, z: number) {
        const scale = 1.0 - z;
        const newWidth = this.width * scale;
        const newHeight = this.height * scale;

        this.tl = new Point(
          center.x - newWidth/2,
          center.y + newHeight/2
        );

        this.br = new Point(
          center.x + newWidth/2,
          center.y - newHeight/2
        );

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
        let previous = -1;
        for ( let index in stops ) {

            const i = parseInt(index);
            const this_stop = stops[i];

            if ( previous >= 0 ) {
                console.log("Generating " + previous + " to " + i);
                const prev_stop = stops[previous];

                const slope_r = (this_stop.r - prev_stop.r) / (i - previous);
                const slope_g = (this_stop.g - prev_stop.g) / (i - previous);
                const slope_b = (this_stop.b - prev_stop.b) / (i - previous);

                for ( let j=previous; j<i; j++ ) {
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
        const color = this.colors[i];
        if (color) {
            return color;
        } else {
            //console.error("Error returning color for index = " + i);
            return new Color(0,0,0);
        }
    }

    rotate() {
        const first = this.colors[1];
        for ( let i=0; i<this.colors.length; i++ ) {
            let new_color;
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
