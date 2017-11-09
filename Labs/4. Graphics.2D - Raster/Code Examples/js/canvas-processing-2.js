﻿"use strict";

/* Assignment
1. (optional) show a message when image processing fails due to CORS
2. modify the code bellow in order to display the image in only black and white in the canvas with the id result
*/

function loadImage() {
    /* 
    CORS Enabled images:
    https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image 
    */

    var img = document.createElement("img");
    //jQuery Equivalent: 
    // $(document.createElement('img')).get(0)
    // $("<img>").get(0)
    // //https://learn.jquery.com/using-jquery-core/faq/how-do-i-pull-a-native-dom-element-from-a-jquery-object/

    img.crossOrigin = "anonymous"; //more details: https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS

    img.onerror = function (msg, url, line) {
        alert("ERROR loading image using url '{0}'.".format(img.src));
    };

    img.onload = function () {
        
        $("#originalImage").empty();
        $("#originalImage").append(img);

        var canvas = document.getElementById("result");
        canvas.height = img.height;
        canvas.width = img.width;

        var context = canvas.getContext("2d");
        context.drawImage(img, 0, 0);

        context.font = "bold 10pt sans-serif";
        context.fillStyle = "#EFEFEF";

        context.fillText(img.src, 8, 25);

        // I. Compute histogram
        var vR = new Array(); //equivalent to var vR = []; Futher reading: http://www.w3schools.com/js/js_arrays.asp
        var vG = [];
        var vB = [];
        for (var i = 0; i < 256; i++){ 
            vR[i] = 0; vG[i] = 0; vB[i] = 0; 
        }

        processImage(
            function (x, y, r, g, b, a) {
                vR[r]++; vG[g]++; vB[b]++;
            }
            );

        drawHistogram(vR, vG, vB);

        // II. Convert to greyscale
        processImage(
            function (x, y, r, g, b, a) {
                var average = (r + g + b) / 3;
                return [average, average, average];
            }
        );
    };

    //Load the actual image
    var imageUrl = $("#txtImageUrl").val();
    img.src = imageUrl;
}

function processImage(action) {
    var canvas = document.getElementById("result");
    var context = canvas.getContext("2d");

    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;

    // iterate over all pixels based on x and y coordinates.

    // loop through each row
    for (var y = 0; y < canvas.height; y++) {
        // loop through each column
        for (var x = 0; x < canvas.width; x++) {
            var offset = ((canvas.width * y) + x) * 4;

            var red = data[offset];
            var green = data[offset + 1];
            var blue = data[offset + 2];
            var alpha = data[offset + 3];

            var result = action(x, y, red, green, blue, alpha);

            if (typeof (result) != "undefined" && result instanceof Array) {
                for (var i = 0; i < result.length; i++) {
                    data[offset + i] = result[i];
                }
            }
        }
    }

    // draw the new image
    context.putImageData(imageData, 0, 0);
}

function drawHistogram(vR, vG, vB) {
    var canvas = document.getElementById("histogram");
    var h = canvas.height;
    var w = canvas.width / vR.length;

    var context = canvas.getContext("2d");
    context.fillStyle = "#DEDEDE";
    context.fillRect(0, 0, canvas.width, canvas.height);

    var f = canvas.height * 0.9 / Math.max.apply(Math, [].concat(vR, vG, vB));

    for (var i = 0; i < vR.length; i++) {

        context.fillStyle = "rgba(10%,10%,10%,0.2)";
        //rgba(red, green, blue, alpha) 
        //The alpha parameter is a number between 0.0 (fully transparent) and 1.0 (fully opaque).
        context.fillRect(i * w, h - (vR[i] + vG[i] + vB[i]) * f, w, (vR[i] + vG[i] + vB[i]) * f);

        context.fillStyle = "rgba(100%,0%,0%,0.3)";
        context.fillRect(i * w, h - vR[i] * f, w, vR[i] * f);

        context.fillStyle = "rgba(0%,100%,0%,0.3)";
        context.fillRect(i * w, h - vG[i] * f, w, vG[i] * f);

        context.fillStyle = "rgba(0%,0%,100%,0.3)";
        context.fillRect(i * w, h - vB[i] * f, w, vB[i] * f);
    }
}

//extends the string prototype object
//Inheritance and the prototype chain: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain 
// "{0} {1}".format(10, 9)
String.prototype.format = String.prototype.f = function () {
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace('{' + i + '}', arguments[i]);
    }
    return s;
};