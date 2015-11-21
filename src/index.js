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
