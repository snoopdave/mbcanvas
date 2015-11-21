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
