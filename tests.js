/**
 * Copyright (c) 2015 David M. Johnson
 * MIT License
 */

// tests for logical to/from canvas coordinate conversions


function tests(canvas) {
    
    var tl = new Point(-10, 10);
    var br = new Point(10, -10);
    var ds = new DrawingSurface(tl, br, canvas);
    console.log("h=" + canvas.height + " w=" + canvas.width);
    
    var s = new Point(0, 0);
    var d = ds.logical_to_canvas(s);
    console.log("Logical Point (" + s.x + "," + s.y + ") -> (" + d.x + "," + d.y + ")");
    
    s = new Point(10, 10);
    d = ds.logical_to_canvas(s);
    console.log("Logical Point (" + s.x + "," + s.y + ") -> (" + d.x + "," + d.y + ")");
    
    s = new Point(-10, -10);
    d = ds.logical_to_canvas(s);
    console.log("Logical Point (" + s.x + "," + s.y + ") -> (" + d.x + "," + d.y + ")");
    
    s = new Point(0, 0);
    d = ds.canvas_to_logical(s);
    console.log("Canvas Point (" + s.x + "," + s.y + ") -> (" + d.x + "," + d.y + ")");
    
    s = new Point(canvas.width, canvas.height);
    d = ds.canvas_to_logical(s);
    console.log("Canvas Point (" + s.x + "," + s.y + ") -> (" + d.x + "," + d.y + ")");
}
