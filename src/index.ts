/**
 * Copyright (c) 2015 David M. Johnson
 * MIT License
 */

// hook MandelCanvas into browser events

import DS = require('./Graphics');
import MC = require('./MandelbrotCanvas');

let mandelbrotCanvas: MC.MandelbrotCanvas;

window.onload = function () {
    const tl = new DS.Point(-2.0, 2.0);
    const br = new DS.Point(2.0, -2.0);
    const canvas: HTMLElement | null = document.getElementById("canvas");
    mandelbrotCanvas = new MC.MandelbrotCanvas(tl, br, canvas as HTMLCanvasElement);
    canvas!.addEventListener("click", function (event: MouseEvent) {
        const cp = new DS.Point(event.offsetX, event.offsetY);
        const lp = mandelbrotCanvas.canvas_to_logical(cp);
        mandelbrotCanvas.zoom(lp, 0.3);
        print_data();
    });

    const zoom_in_button = document.getElementById("zoom_in");
    zoom_in_button!.addEventListener("click", function () {
        mandelbrotCanvas.zoom_in(0.3);
        print_data();
    });

    const zoom_out_button = document.getElementById("zoom_out");
    zoom_out_button!.addEventListener("click", function () {
        mandelbrotCanvas.zoom_out(-0.3);
        print_data();
    });

    const reset_view_button = document.getElementById("reset_view");
    reset_view_button!.addEventListener("click", function () {
        mandelbrotCanvas.reset_view();
        print_data();
    });

    const rotate_colors_button = document.getElementById("rotate_colors");
    rotate_colors_button!.addEventListener("click", function () {
        for (let i = 0; i < 5; i++) {
            mandelbrotCanvas.rotate_colors();
        }
        print_data();
    });

    mandelbrotCanvas.draw_mandelbrot();
    print_data();
};

function print_data() {
    document.getElementById("log")!.innerHTML =
        "Top Left ("    +mandelbrotCanvas.tl.x.toFixed(8)+", "+mandelbrotCanvas.tl.y.toFixed(8)+")<br>"
        +"Bottom Right ("+mandelbrotCanvas.br.x.toFixed(8)+", "+mandelbrotCanvas.br.y.toFixed(8)+")<br>"
        +"Set Size "+mandelbrotCanvas.set_size;
}

