/**
 * Copyright (c) 2015 David M. Johnson
 * MIT License
 */

// Mandelbrot viewer based on HTML5 canvas

import DS = require('./Graphics');

export class MandelbrotCanvas extends DS.DrawingSurface {

    private data: ImageData;
    private colors: DS.ColorTable;
    private palette: string;

    max_iterations: number; // give each point this many attempts to "escape" from the set
    set_size: number;       // count of number of points in last Mandelbrot set computed

    constructor( tl: DS.Point, br: DS.Point, canvas: HTMLCanvasElement ) {
        super( tl, br, canvas );
        this.max_iterations = 500;
        this.palette = "classic";
        this.init_colors(this.palette);
    }

    private init_colors(palette: string) {
        this.colors = new DS.ColorTable(this.build_color_stops(palette));
    }

    private build_color_stops(palette: string) {
        const stops: Array<DS.Color> = [];

        switch (palette) {
            case "fire":
                stops[0]   = new DS.Color(0, 0, 0);
                stops[1]   = new DS.Color(80, 0, 0);
                stops[120] = new DS.Color(255, 60, 0);
                stops[240] = new DS.Color(255, 160, 0);
                stops[360] = new DS.Color(255, 240, 0);
                stops[500] = new DS.Color(255, 255, 255);
                break;
            case "ice":
                stops[0]   = new DS.Color(0, 0, 0);
                stops[1]   = new DS.Color(0, 30, 60);
                stops[160] = new DS.Color(0, 120, 255);
                stops[320] = new DS.Color(0, 200, 255);
                stops[420] = new DS.Color(180, 255, 255);
                stops[500] = new DS.Color(255, 255, 255);
                break;
            case "neon":
                stops[0]   = new DS.Color(0, 0, 0);
                stops[1]   = new DS.Color(40, 0, 60);
                stops[120] = new DS.Color(120, 0, 255);
                stops[240] = new DS.Color(0, 255, 200);
                stops[360] = new DS.Color(255, 0, 150);
                stops[500] = new DS.Color(255, 255, 255);
                break;
            default:
                stops[0]   = new DS.Color(0,0,0);
                stops[1]   = new DS.Color(50,0,0);
                stops[160] = new DS.Color(255,0,0);
                stops[320] = new DS.Color(255,255,0);
                stops[420] = new DS.Color(0,0,255);
                stops[500] = new DS.Color(0,0,255);
                break;
        }

        return stops;
    }

    /**
     * Draw Mandelbrot set with current view-port settings.
     */
    draw_mandelbrot() {

        const context = this.canvas.getContext("2d");
        if (context == null) {
            console.error("Error: unable to get 2d context");
            return;
        }
        const image = context.createImageData(this.canvas.width, this.canvas.height);
        this.data = context.createImageData(this.canvas.width, this.canvas.height);

        this.set_size = 0;
        console.time("create_image");
        
        // loop through all pixels in canvas
        for ( let x=0; x<this.canvas.width; x++) {

            for ( let y=0; y<this.canvas.height; y++) {

                // determine logical coordinates of pixel
                const canvas_point = new DS.Point(x, y);
                const complex = this.canvas_to_logical(canvas_point);

                // determine if point is in Mandelbrot set
                const m = this.mandelbrot(complex, 4, this.max_iterations);

                if (m == 0) {
                    this.set_size++;
                }

                const offset = (x + y * this.canvas.width) * 4;
                const color = this.colors.get(m);
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

        const squared = new DS.Point(start.x, start.y);
        let count = 0;
        while ( count++ < iterations ) {

            const x2 = Math.pow(squared.x, 2);
            const y2 = Math.pow(squared.y, 2);

            if ( (x2 + y2) > limit ) { // not in the set 
                return count;
            }

            // square of a complex (x + yi) = (x*x - y*y, 2*x*y)
            const sx = x2 - y2;
            const sy = (2 * squared.x * squared.y);

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

    pan(dx: number, dy: number) {
        super.pan(dx, dy);
        this.draw_mandelbrot();
    }

    reset_view() {
        super.reset_view();
        this.draw_mandelbrot();
    }

    rotate_colors() {

        console.time("rotate_colors");

        const context = this.canvas.getContext("2d");
        if (context == null) {
            console.error("Error: unable to get 2d context");
            return;
        }
        const image = context.createImageData(this.canvas.width, this.canvas.height);

        this.colors.rotate();
        
        // loop through all pixels in canvas
        for ( let x=0; x<this.canvas.width; x++) {

            for ( let y=0; y<this.canvas.height; y++) {

                const offset = (x + y * this.canvas.width) * 4;
                const color_index = this.data.data[offset];

                const color = this.colors.get(color_index);
                image.data[offset    ] = color.r;
                image.data[offset + 1] = color.g;
                image.data[offset + 2] = color.b;
                image.data[offset + 3] = 255;
            }
        }
        console.timeEnd("rotate_colors");

        context.putImageData(image, 0, 0);
    }

    set_max_iterations(iterations: number) {
        this.max_iterations = iterations;
        this.draw_mandelbrot();
    }

    set_color_palette(palette: string) {
        this.palette = palette;
        this.init_colors(palette);
        this.draw_mandelbrot();
    }

    get palette_name() {
        return this.palette;
    }
}
