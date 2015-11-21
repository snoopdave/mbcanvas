(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Copyright (c) 2015 David M. Johnson
 * MIT License
 */
// Drawing surface with logical 2D coordinate system
var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point;
})();
exports.Point = Point;
var Color = (function () {
    function Color(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    return Color;
})();
exports.Color = Color;
var DrawingSurface = (function () {
    function DrawingSurface(tl, br, canvas) {
        this.tl = tl;
        this.br = br;
        this.tl0 = tl;
        this.br0 = br;
        this.canvas = canvas;
        this.init_viewport();
    }
    DrawingSurface.prototype.init_viewport = function () {
        this.width = this.br.x - this.tl.x;
        this.height = this.tl.y - this.br.y;
        this.xscale = this.canvas.width / (this.br.x - this.tl.x);
        this.yscale = this.canvas.height / (this.tl.y - this.br.y);
    };
    DrawingSurface.prototype.logical_to_canvas = function (lp) {
        return new Point(this.xscale * (lp.x - this.tl.x), (this.canvas.height) - this.yscale * (lp.y - this.br.y));
    };
    DrawingSurface.prototype.canvas_to_logical = function (cp) {
        return new Point(cp.x / this.xscale + this.tl.x, (this.tl.y - this.br.y) - (cp.y / this.yscale - this.br.y));
    };
    DrawingSurface.prototype.zoom_in = function (z) {
        var center = new Point(this.br.x - this.width / 2, this.tl.y - this.height / 2);
        this.zoom(center, z);
    };
    DrawingSurface.prototype.zoom_out = function (z) {
        var center = new Point(this.br.x - this.width / 2, this.tl.y - this.height / 2);
        this.zoom(center, z);
    };
    DrawingSurface.prototype.zoom = function (center, z) {
        var dx = this.width * z;
        var dy = this.height * z;
        this.tl = new Point(center.x - this.width / 2 + dx, center.y + this.height / 2 - dy);
        this.br = new Point(center.x + this.width / 2 - dx, center.y - this.height / 2 + dy);
        this.init_viewport();
    };
    DrawingSurface.prototype.reset_view = function () {
        this.tl = this.tl0;
        this.br = this.br0;
        this.init_viewport();
    };
    return DrawingSurface;
})();
exports.DrawingSurface = DrawingSurface;
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
    ColorTable.prototype.rotate = function () {
        var first = this.colors[1];
        for (var i = 0; i < this.colors.length; i++) {
            var new_color;
            if (i == 0) {
                continue;
            }
            else if (i == this.colors.length - 1) {
                new_color = first; // wrap around
            }
            else {
                new_color = this.colors[i + 1];
            }
            this.colors[i].r = new_color.r;
            this.colors[i].g = new_color.g;
            this.colors[i].b = new_color.b;
        }
    };
    return ColorTable;
})();
exports.ColorTable = ColorTable;

},{}],2:[function(require,module,exports){
/**
 * Copyright (c) 2015 David M. Johnson
 * MIT License
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
// Mandelbrot viewer based on HTML5 canvas
var DS = require('./Graphics');
var MandelbrotCanvas = (function (_super) {
    __extends(MandelbrotCanvas, _super);
    function MandelbrotCanvas(tl, br, canvas) {
        _super.call(this, tl, br, canvas);
        this.max_iterations = 500;
        this.init_colors();
    }
    MandelbrotCanvas.prototype.init_colors = function () {
        var stops = [];
        stops[0] = new DS.Color(0, 0, 0);
        stops[1] = new DS.Color(50, 0, 0);
        stops[160] = new DS.Color(255, 0, 0);
        stops[320] = new DS.Color(255, 255, 0);
        stops[420] = new DS.Color(0, 0, 255);
        stops[500] = new DS.Color(0, 0, 255);
        this.colors = new DS.ColorTable(stops);
    };
    /**
     * Draw Mandelbrot set with current view-port settings.
     */
    MandelbrotCanvas.prototype.draw_mandelbrot = function () {
        var context = this.canvas.getContext("2d");
        var image = context.createImageData(this.canvas.width, this.canvas.height);
        this.data = context.createImageData(this.canvas.width, this.canvas.height);
        this.set_size = 0;
        console.time("create_image");
        // loop through all pixels in canvas
        for (var x = 0; x < this.canvas.width; x++) {
            for (var y = 0; y < this.canvas.height; y++) {
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
                image.data[offset] = color.r;
                image.data[offset + 1] = color.g;
                image.data[offset + 2] = color.b;
                image.data[offset + 3] = 255;
                this.data.data[offset] = m;
            }
        }
        console.timeEnd("create_image");
        context.putImageData(image, 0, 0);
    };
    /**
     * Determine if point is in Mandelbrot set, or how close it got to being considered in the set.
     * @param {Point} start The point to be tested.
     * @returns {number} 0 if point is in set or number of iterations before it "escaped"
     */
    MandelbrotCanvas.prototype.mandelbrot = function (start, limit, iterations) {
        var squared = new DS.Point(start.x, start.y);
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
    MandelbrotCanvas.prototype.zoom = function (center, z) {
        _super.prototype.zoom.call(this, center, z);
        this.draw_mandelbrot();
    };
    MandelbrotCanvas.prototype.reset_view = function () {
        _super.prototype.reset_view.call(this);
        this.draw_mandelbrot();
    };
    MandelbrotCanvas.prototype.rotate_colors = function () {
        console.time("rotate_colors");
        var context = this.canvas.getContext("2d");
        var image = context.createImageData(this.canvas.width, this.canvas.height);
        this.colors.rotate();
        // loop through all pixels in canvas
        for (var x = 0; x < this.canvas.width; x++) {
            for (var y = 0; y < this.canvas.height; y++) {
                var offset = (x + y * this.canvas.width) * 4;
                var color_index = this.data.data[offset];
                var color = this.colors.get(color_index);
                image.data[offset] = color.r;
                image.data[offset + 1] = color.g;
                image.data[offset + 2] = color.b;
                image.data[offset + 3] = 255;
            }
        }
        console.timeEnd("rotate_colors");
        context.putImageData(image, 0, 0);
    };
    return MandelbrotCanvas;
})(DS.DrawingSurface);
exports.MandelbrotCanvas = MandelbrotCanvas;

},{"./Graphics":1}],3:[function(require,module,exports){
/**
 * Copyright (c) 2015 David M. Johnson
 * MIT License
 */
// hook MandelCanvas into browswer events
var DS = require('./Graphics');
var MC = require('./MandelbrotCanvas');
var ds;
var canvas;
window.onload = function () {
    var tl = new DS.Point(-2.0, 2.0);
    var br = new DS.Point(2.0, -2.0);
    canvas = document.getElementById("canvas");
    canvas.addEventListener("click", function (event) {
        var cp = new DS.Point(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
        var lp = ds.canvas_to_logical(cp);
        ds.zoom(lp, 0.3);
        print_data();
    });
    var zoom_in_button = document.getElementById("zoom_in");
    zoom_in_button.addEventListener("click", function () {
        ds.zoom_in(0.3);
        print_data();
        return event;
    });
    var zoom_out_button = document.getElementById("zoom_out");
    zoom_out_button.addEventListener("click", function () {
        ds.zoom_out(-0.3);
        print_data();
    });
    var reset_view_button = document.getElementById("reset_view");
    reset_view_button.addEventListener("click", function () {
        ds.reset_view();
        print_data();
    });
    var rotate_colors_button = document.getElementById("rotate_colors");
    rotate_colors_button.addEventListener("click", function () {
        for (var i = 0; i < 5; i++) {
            ds.rotate_colors();
        }
        print_data();
    });
    ds = new MC.MandelbrotCanvas(tl, br, canvas);
    ds.draw_mandelbrot();
    print_data();
};
function print_data() {
    document.getElementById("log").innerHTML =
        "Top Left (" + ds.tl.x.toFixed(8) + ", " + ds.tl.y.toFixed(8) + ")<br>"
            + "Bottom Right (" + ds.br.x.toFixed(8) + ", " + ds.br.y.toFixed(8) + ")<br>"
            + "Set Size " + ds.set_size;
}

},{"./Graphics":1,"./MandelbrotCanvas":2}]},{},[3,1,2]);
