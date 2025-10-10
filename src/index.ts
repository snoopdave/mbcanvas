/**
 * Copyright (c) 2015 David M. Johnson
 * MIT License
 */

// hook MandelCanvas into browser events

import DS = require('./Graphics');
import MC = require('./MandelbrotCanvas');

const paletteLabels: Record<string, string> = {
    "classic": "Classic Ember",
    "fire": "Solar Storm",
    "ice": "Arctic Aurora",
    "neon": "Neon Dreams"
};

let mandelbrotCanvas: MC.MandelbrotCanvas;
let canvasElement: HTMLCanvasElement;
let iterationValueElement: HTMLElement;
let autoRotateHandle: number | null = null;
let autoRotateActive = false;
let isDragging = false;
let dragStartPoint: DS.Point | null = null;
let hasDragged = false;
let suppressNextClick = false;

window.onload = function () {
    const tl = new DS.Point(-2.0, 2.0);
    const br = new DS.Point(2.0, -2.0);
    canvasElement = document.getElementById("canvas") as HTMLCanvasElement;
    mandelbrotCanvas = new MC.MandelbrotCanvas(tl, br, canvasElement);

    iterationValueElement = document.getElementById("iteration_value")!;

    const zoom_in_button = document.getElementById("zoom_in");
    zoom_in_button!.addEventListener("click", function (event) {
        event.preventDefault();
        mandelbrotCanvas.zoom_in(0.3);
        print_data();
    });

    const zoom_out_button = document.getElementById("zoom_out");
    zoom_out_button!.addEventListener("click", function (event) {
        event.preventDefault();
        mandelbrotCanvas.zoom_out(-0.3);
        print_data();
    });

    const reset_view_button = document.getElementById("reset_view");
    reset_view_button!.addEventListener("click", function (event) {
        event.preventDefault();
        mandelbrotCanvas.reset_view();
        print_data();
    });

    const rotate_colors_button = document.getElementById("rotate_colors");
    rotate_colors_button!.addEventListener("click", function (event) {
        event.preventDefault();
        for (let i = 0; i < 5; i++) {
            mandelbrotCanvas.rotate_colors();
        }
        print_data();
    });

    const iterationInput = document.getElementById("iteration_depth") as HTMLInputElement;
    iterationInput.value = mandelbrotCanvas.max_iterations.toString();
    update_iteration_label(mandelbrotCanvas.max_iterations);
    iterationInput.addEventListener("input", function (event) {
        const value = parseInt((event.target as HTMLInputElement).value, 10);
        update_iteration_label(value);
    });
    iterationInput.addEventListener("change", function (event) {
        const value = parseInt((event.target as HTMLInputElement).value, 10);
        mandelbrotCanvas.set_max_iterations(value);
        print_data();
    });

    const paletteSelect = document.getElementById("color_scheme") as HTMLSelectElement;
    paletteSelect.value = mandelbrotCanvas.palette_name;
    paletteSelect.addEventListener("change", function (event) {
        const palette = (event.target as HTMLSelectElement).value;
        mandelbrotCanvas.set_color_palette(palette);
        print_data();
    });

    const autoRotateToggle = document.getElementById("auto_rotate") as HTMLInputElement;
    autoRotateToggle.addEventListener("change", function (event) {
        const enabled = (event.target as HTMLInputElement).checked;
        update_auto_rotate(enabled);
        print_data();
    });

    canvasElement.addEventListener("mousedown", function (event: MouseEvent) {
        isDragging = true;
        hasDragged = false;
        dragStartPoint = new DS.Point(event.offsetX, event.offsetY);
        canvasElement.classList.add("is-dragging");
    });

    canvasElement.addEventListener("mousemove", function (event: MouseEvent) {
        if (!isDragging || dragStartPoint == null) {
            return;
        }

        const currentPoint = new DS.Point(event.offsetX, event.offsetY);
        const previousLogical = mandelbrotCanvas.canvas_to_logical(dragStartPoint);
        const currentLogical = mandelbrotCanvas.canvas_to_logical(currentPoint);
        const dx = previousLogical.x - currentLogical.x;
        const dy = previousLogical.y - currentLogical.y;

        if (dx !== 0 || dy !== 0) {
            mandelbrotCanvas.pan(dx, dy);
            dragStartPoint = currentPoint;
            hasDragged = true;
            print_data();
        }
    });

    const finishDrag = function () {
        if (!isDragging) {
            return;
        }
        isDragging = false;
        dragStartPoint = null;
        canvasElement.classList.remove("is-dragging");
        if (hasDragged) {
            suppressNextClick = true;
            window.setTimeout(function () {
                suppressNextClick = false;
            }, 0);
        }
    };

    canvasElement.addEventListener("mouseup", finishDrag);
    canvasElement.addEventListener("mouseleave", finishDrag);

    canvasElement.addEventListener("click", function (event: MouseEvent) {
        if (suppressNextClick) {
            return;
        }
        const cp = new DS.Point(event.offsetX, event.offsetY);
        const lp = mandelbrotCanvas.canvas_to_logical(cp);
        mandelbrotCanvas.zoom(lp, 0.3);
        print_data();
    });

    mandelbrotCanvas.draw_mandelbrot();
    print_data();
};

function update_iteration_label(value: number) {
    if (iterationValueElement) {
        iterationValueElement.textContent = value.toString();
    }
}

function start_auto_rotate() {
    if (autoRotateHandle != null) {
        return;
    }
    autoRotateHandle = window.setInterval(function () {
        mandelbrotCanvas.rotate_colors();
    }, 120);
    autoRotateActive = true;
}

function stop_auto_rotate() {
    if (autoRotateHandle == null) {
        return;
    }
    window.clearInterval(autoRotateHandle);
    autoRotateHandle = null;
    autoRotateActive = false;
}

function update_auto_rotate(enabled: boolean) {
    if (enabled) {
        start_auto_rotate();
    } else {
        stop_auto_rotate();
    }
}

function print_data() {
    const logElement = document.getElementById("log");
    if (!logElement) {
        return;
    }

    const initialWidth = mandelbrotCanvas.br0.x - mandelbrotCanvas.tl0.x;
    const zoomFactor = initialWidth / mandelbrotCanvas.width;
    const pixelCount = canvasElement.width * canvasElement.height;
    const density = (mandelbrotCanvas.set_size / pixelCount) * 100;
    const paletteName = paletteLabels[mandelbrotCanvas.palette_name] || mandelbrotCanvas.palette_name;

    logElement.innerHTML =
        '<div class="coordinate"><span class="label">Top Left</span><span>(' +
        mandelbrotCanvas.tl.x.toFixed(8) + ', ' + mandelbrotCanvas.tl.y.toFixed(8) +
        ')</span></div>' +
        '<div class="coordinate"><span class="label">Bottom Right</span><span>(' +
        mandelbrotCanvas.br.x.toFixed(8) + ', ' + mandelbrotCanvas.br.y.toFixed(8) +
        ')</span></div>' +
        '<div class="stats-row">' +
        '<div class="stat"><span class="label">Zoom</span><span class="value">' + zoomFactor.toFixed(2) + '×</span></div>' +
        '<div class="stat"><span class="label">Iterations</span><span class="value">' + mandelbrotCanvas.max_iterations + '</span></div>' +
        '<div class="stat"><span class="label">Palette</span><span class="value">' + paletteName + '</span></div>' +
        '<div class="stat"><span class="label">Auto Rotate</span><span class="value ' + (autoRotateActive ? 'is-active' : '') + '">' + (autoRotateActive ? 'On' : 'Off') + '</span></div>' +
        '</div>' +
        '<div class="set-size">Set coverage: ' + mandelbrotCanvas.set_size + ' px (' + density.toFixed(2) + '%)</div>';
}

