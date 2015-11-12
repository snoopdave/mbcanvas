/**
 * Copyright (c) 2015 David M. Johnson
 * MIT License
 */
// mbcanvas - Mandelbrot viewer based on HTML5 canvas
var MandelbrotCanvas = (function () {
    function MandelbrotCanvas(tl, br, canvas) {
        this.max_iterations = 500;
        this.tl = tl;
        this.br = br;
        this.tl0 = tl;
        this.br0 = br;
        this.canvas = canvas;
        this.init_viewport();
        this.init_colors();
    }
    MandelbrotCanvas.prototype.init_colors = function () {
        var stops = [];
        stops[0] = new Color(0, 0, 0);
        stops[1] = new Color(50, 0, 0);
        stops[160] = new Color(255, 0, 0);
        stops[320] = new Color(255, 255, 0);
        stops[420] = new Color(0, 0, 255);
        stops[501] = new Color(255, 0, 255);
        this.colors = new ColorTable(stops);
    };
    MandelbrotCanvas.prototype.init_viewport = function () {
        this.width = this.br.x - this.tl.x;
        this.height = this.tl.y - this.br.y;
        this.xscale = this.canvas.width / (this.br.x - this.tl.x);
        this.yscale = this.canvas.height / (this.tl.y - this.br.y);
    };
    /**
     * Draw Mandelbrot set with current view-port settings.
     */
    MandelbrotCanvas.prototype.draw_mandelbrot = function () {
        var context = this.canvas.getContext("2d");
        var image = context.createImageData(this.canvas.width, this.canvas.height);
        var data = context.createImageData(this.canvas.width, this.canvas.height);
        this.set_size = 0;
        // loop through all pixels in canvas
        for (var x = 0; x < this.canvas.width; x++) {
            for (var y = 0; y < this.canvas.height; y++) {
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
                image.data[offset] = color.r;
                image.data[offset + 1] = color.g;
                image.data[offset + 2] = color.b;
                image.data[offset + 3] = 255;
                data.data[offset] = m;
            }
        }
        context.putImageData(image, 0, 0);
    };
    /**
     * Determine if point is in Mandelbrot set, or how close it got to being considered in the set.
     * @param {Point} start The point to be tested.
     * @returns {number} 0 if point is in set or number of iterations before it "escaped"
     */
    MandelbrotCanvas.prototype.mandelbrot = function (start, limit, iterations) {
        var squared = new Point(start.x, start.y);
        var count = 0;
        while (count++ < iterations) {
            var x2 = Math.pow(squared.x, 2);
            var y2 = Math.pow(squared.y, 2);
            if ((x2 + y2) > limit) {
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
    };
    MandelbrotCanvas.prototype.logical_to_canvas = function (lp) {
        return new Point(this.xscale * (lp.x - this.tl.x), (this.canvas.height) - this.yscale * (lp.y - this.br.y));
    };
    MandelbrotCanvas.prototype.canvas_to_logical = function (cp) {
        return new Point(cp.x / this.xscale + this.tl.x, (this.tl.y - this.br.y) - (cp.y / this.yscale - this.br.y));
    };
    MandelbrotCanvas.prototype.zoom_in = function (z) {
        var center = new Point(this.br.x - this.width / 2, this.tl.y - this.height / 2);
        this.zoom(center, z);
    };
    MandelbrotCanvas.prototype.zoom_out = function (z) {
        var center = new Point(this.br.x - this.width / 2, this.tl.y - this.height / 2);
        this.zoom(center, z);
    };
    MandelbrotCanvas.prototype.zoom = function (center, z) {
        var dx = this.width * z;
        var dy = this.height * z;
        this.tl = new Point(center.x - this.width / 2 + dx, center.y + this.height / 2 - dy);
        this.br = new Point(center.x + this.width / 2 - dx, center.y - this.height / 2 + dy);
        this.init_viewport();
        this.draw_mandelbrot();
    };
    MandelbrotCanvas.prototype.reset_view = function () {
        this.tl = this.tl0;
        this.br = this.br0;
        this.init_viewport();
        this.draw_mandelbrot();
    };
    MandelbrotCanvas.prototype.rotate_colors = function () {
    };
    return MandelbrotCanvas;
})();
var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point;
})();
var ColorTable = (function () {
    /**
     * @param stops Sparse array of color stops from which color table will be interpolated.
     */
    function ColorTable(stops) {
        this.colors = [];
        var previous = -1;
        for (var index in stops) {
            var i = parseInt(index);
            var this_stop = stops[i];
            if (previous >= 0) {
                console.log("Generating " + previous + " to " + i);
                var prev_stop = stops[previous];
                var slope_r = (this_stop.r - prev_stop.r) / (i - previous);
                var slope_g = (this_stop.g - prev_stop.g) / (i - previous);
                var slope_b = (this_stop.b - prev_stop.b) / (i - previous);
                for (var j = previous; j < i; j++) {
                    this.colors[j] = new Color(-slope_r * (previous - j) + stops[previous].r, -slope_g * (previous - j) + stops[previous].g, -slope_b * (previous - j) + stops[previous].b);
                    console.log(j + " -> " + this.colors[j].r + ", " + this.colors[j].g + ", " + this.colors[j].b);
                }
            }
            else {
                this.colors[i] = stops[i];
            }
            previous = i;
        }
    }
    ColorTable.prototype.get = function (i) {
        var color = this.colors[i];
        if (color) {
            return color;
        }
        else {
            //console.error("Error returning color for index = " + i);
            return new Color(0, 0, 0);
        }
    };
    return ColorTable;
})();
var Color = (function () {
    function Color(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    return Color;
})();
//# sourceMappingURL=MandelbrotCanvas.js.map