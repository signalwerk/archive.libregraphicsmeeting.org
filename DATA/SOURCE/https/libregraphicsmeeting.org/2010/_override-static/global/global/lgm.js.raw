/* 
LGM 2010
Authors: 
Alexandre Leray (http://www.alexandreleray.com) and Pierre Marchand (http://www.oep-h.com/) @ OSP (http://ospublish.constantvzw.org/)
*/

jQuery.noConflict();

function zoom_pan() {
    /*
    Change the viewbox attribute of the SVG background
    */
    var svg = jQuery('#svg')
    var vb = svg.attr('viewBox');
    vb = vb.split(" ");
    var nvb = new Array(4);
    nvb[2] = Math.random()*vb[2];
    nvb[3] = Math.random()*vb[3];
    nvb[0] = Math.random()*nvb[2];
    nvb[1] = Math.random()*nvb[3];
    nvb = nvb.join(" ");
    svg.attr('viewBox', nvb);
};


function init () {
    /*
    Detect browser SVG compatibility and load the appropriate background
    */
    if ((jQuery.browser.safari && jQuery.browser.version.split('.')[0] >= 522) ||
        (jQuery.browser.mozilla && jQuery.browser.version.substr(0,3) >= 1.8) ||
        (jQuery.browser.opera && jQuery.browser.version >= 8.0)) 
    {
        // Insert the iframe
        jQuery('body').append('<iframe src="_override-static/global/global/background.svg"></iframe>');
    }
/* 
TODO:
Prepare a dozen of PNG images for browsers not supporting SVG
*/
    // else {
    //     // compute a random image filename
    //     var randomImage = Math.floor(Math.random()*10);
    //     jQuery('body').css("background-image", "url(/static/css/background_include_" + randomImage + ".png)");
    // }
}

jQuery(document).ready(init);
