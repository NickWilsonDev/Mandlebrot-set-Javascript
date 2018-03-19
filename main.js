/* main.js */

// Get the canvas and context
var canvas = document.getElementById("viewport");
var context = canvas.getContext("2d");


// width and height of image
var image_width = canvas.width;
var image_height = canvas.height;

// image data (RGBA)
var imagedata = context.createImageData(image_width, image_height);

// Pan and zoom parameters
var offsetx = -image_width/2;
var offsety = -image_height/2;
var panx = -100;
var pany = 0;
var zoom = 150;

// maximum number of iterations per pixel
var maxiterations = 250;

// Palette array of 256 colors
var palette = [];

    // (...)

// Generate palette
function generatePalette() {
    // Calculate a gradient
    var roffset = 24;
    var goffset = 16;
    var boffset = 0;
    for (var i=0; i<256; i++) {
        palette[i] = { r:roffset, g:goffset, b:boffset};

        if (i < 64) {
            roffset += 3;
        } else if (i<128) {
            goffset += 3;
        } else if (i<192) {
                boffset += 3;
        }
    }
}

 
// Calculate the color of a specific pixel
function iterate(x, y, maxiterations) {
    // Convert the screen coordinate to a fractal coordinate
    var x0 = (x + offsetx + panx) / zoom;
    var y0 = (y + offsety + pany) / zoom;

    // Iteration variables
    var a = 0;
    var b = 0;
    var rx = 0;
    var ry = 0;

    // Iterate
    var iterations = 0;
    while (iterations < maxiterations && (rx * rx + ry * ry <= 4)) {
        rx = a * a - b * b + x0;
        ry = 2 * a * b + y0;

        // Next iteration
        a = rx;
        b = ry;
        iterations++;
    }

    // Get palette color based on the number of iterations
    var color;
    if (iterations == maxiterations) {
        color = { r:0, g:0, b:0}; // Black
    } else {
        var index = Math.floor((iterations / (maxiterations-1)) * 255);
        color = palette[index];
    }

    // Apply the color
    var pixelindex = (y * image_width + x) * 4;
    imagedata.data[pixelindex] = color.r;
    imagedata.data[pixelindex+1] = color.g;
    imagedata.data[pixelindex+2] = color.b;
    imagedata.data[pixelindex+3] = 255;
}


// generate fractal image
function generateImage() {
    // iterate over pixels
    for (var y = 0; y < image_height; y++) {
        for (var x = 0; x < image_width; x++) {
            iterate(x, y, maxiterations);
        }
    }
}

// zoom the fractal
function zoomFractal(x, y, factor, zoomin) {
    if (zoomin) {
        zoom *= factor;
        panx = factor * (x + offsetx + panx);
        pany = factor * (y + offsety + pany);
    } else {
        // zoom out
        zoom /= factor;
        panx = (x + offsetx + panx) / factor;
        pany = (y + offsety + pany) / factor;
    }
}

// get mouse position
function getMousePos(canvas, e) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: Math.round((e.clientX - rect.left) / (rect.right - rect.left) * canvas.width),
        y: Math.round((e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height)
    };
}

// mouse event handlers
function onMouseDown(e) {
    var pos = getMousePos(canvas, e);

    var zoomin = true;
    if (e.ctrlKey) {
        zoomin = false;
    }

    var zoomfactor = 2;
    if (e.shiftKey) {
        zoomfactor = 1;
    }

    zoomFractal(pos.x, pos.y, zoomfactor, zoomin);

    generateImage();
}


function main(tFrame) {
    window.requestAnimationFrame(main);

    context.putImageData(imagedata, 0, 0);
}

// initialize the game
function init() {
    canvas.addEventListener("mousedown", onMouseDown);

    generatePalette();

    generateImage();

    main(0);
}

init();
