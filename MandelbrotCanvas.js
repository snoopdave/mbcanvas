/**
 * Copyright (c) 2015 David M. Johnson
 * MIT License
 */
// mbcanvas - Mandelbrot viewer based on HTML5 canvas
var MandelbrotCanvas = (function () {
    function MandelbrotCanvas(tl, br, canvas) {
        this.tl = tl;
        this.br = br;
        this.tl0 = tl;
        this.br0 = br;
        this.canvas = canvas;
        this.init_viewport();
        this.zoom_out_button = new ZoomOutButton(canvas);
    }
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
        this.set_size = 0;
        // loop through all pixels in canvas
        for (var x = 0; x < this.canvas.width; x++) {
            for (var y = 0; y < this.canvas.height; y++) {
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
    };
    /**
     * Determine if point is in Mandelbrot set, or how close it got to being considered in the set.
     * @param {Point} start The point to be tested.
     * @returns {number} 0 if point is in set or number of iterations before it was rules to be out of the set.
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
    MandelbrotCanvas.prototype.zoom_in = function (center, z) {
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
    MandelbrotCanvas.prototype.reset_zoom = function () {
        this.tl = this.tl0;
        this.br = this.br0;
        this.init_viewport();
        this.draw_mandelbrot();
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
var ZoomOutButton = (function () {
    function ZoomOutButton(canvas) {
        this.tl = new Point(10, 10);
        this.br = new Point(40, 40);
        this.width = this.br.x - this.tl.x;
        this.height = this.tl.y - this.br.y;
        this.canvas = canvas;
    }
    ZoomOutButton.prototype.draw = function () {
        var context = this.canvas.getContext("2d");
        context.strokeStyle = "rgb(255,255,255)";
        context.strokeRect(this.tl.x, this.br.y, this.width, this.height);
    };
    ZoomOutButton.prototype.is_hit = function (cp) {
        // remember with canvas coordinates, y is inverted
        if (cp.x >= this.tl.x && cp.x <= this.br.x && cp.y >= this.tl.y && cp.y <= this.br.y) {
            return true;
        }
        return false;
    };
    return ZoomOutButton;
})();
