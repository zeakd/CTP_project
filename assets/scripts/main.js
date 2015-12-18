//(function () {
var imageInput = document.getElementById("image-input-hidden");
var imageInputButton = document.getElementById("image-input-button");
var shell = document.getElementById("shell");
var ti = document.getElementById("target-image");
var histos = document.getElementById("histos");
    
var roth = new Rothko(ti);
ti.onload = targetImageOnload;

var colors;
var parts;
var components;

var playing = false;
var playingButton = document.getElementById("play-button");
playingButton.addEventListener("click", function () {
    playing = !playing;
    if (playing) {
        this.innerHTML = "음악 정지";
        this.className = "active";
        var ret = playSound(colors.dominants, 
                            colors.chromas, 
                            colors.achromas, 
                            colors.highSaturates);
        parts = ret.parts;
        components = ret.components;
    } else {
        this.innerHTML = "음악 재생";
        this.className = "";
        stopSound(parts, components);
    }
})

imageInput.addEventListener('change', function(){
    var file = this.files[0];
    var url = URL.createObjectURL(file);
    if (playing) {
        stopSound(parts, components);
    }

    
    if (url) {
        ti.src = url;
    }
});

imageInputButton.addEventListener("drop", function(e){
    e.stopPropagation();
    e.preventDefault();
    var files = e.target.files || e.dataTransfer.files;
    imageInput.files = files;
}, false);

imageInputButton.addEventListener("dragover", function(e){
    e.stopPropagation();
    e.preventDefault();
}, false);

function pickColors () {
    colors = roth.getColorsSync();
    
    var dominantColors = colors.dominants;
    var highSatColors = colors.highSaturates;
    var chromaColors = colors.chromas;
    var achromaColors = colors.achromas;

    var elDominantColors = document.getElementById("dominant-colors");
    var elDominantTarget = elDominantColors.children[1];
    elDominantTarget.innerHTML = "";
    var elHighSatColors = document.getElementById("high-sat-colors");
    var elHighSatTarget = elHighSatColors.children[1];
    elHighSatTarget.innerHTML = "";
    var elChromaColors = document.getElementById("chroma-colors");
    var elChromaTarget = elChromaColors.children[1];
    elChromaTarget.innerHTML = "";
    var elAchromaColors = document.getElementById("achroma-colors");
    var elAchromaTarget = elAchromaColors.children[1];
    elAchromaTarget.innerHTML = ""
    
    for (var i = 0; i < dominantColors.length; ++i) {
        var hex = chroma.rgb(dominantColors[i]).hex();
        var el = document.createElement("div");
        el.style.backgroundColor = hex;
        el.className = "color";
        elDominantTarget.appendChild(el);
    }

    for (var i = 0; i < highSatColors.length; ++i) {
        var hex = chroma.rgb(highSatColors[i]).hex();
        var el = document.createElement("div");
        el.style.backgroundColor = hex;
        el.className = "color";
        elHighSatTarget.appendChild(el);
    }

    for (var i = 0; i < chromaColors.length; ++i) {
        var hex = chroma.rgb(chromaColors[i]).hex();
        var el = document.createElement("div");
        el.style.backgroundColor = hex;
        el.className = "color";
        elChromaTarget.appendChild(el);
    }

    for (var i = 0; i < achromaColors.length; ++i) {
        var hex = chroma.rgb(achromaColors[i]).hex();
        var el = document.createElement("div");
        el.style.backgroundColor = hex;
        el.className = "color";
        elAchromaTarget.appendChild(el);
    }
    return colors;
}

var env;
function targetImageOnload() {
    pickColors();
    if (playing) {
        var ret = playSound(colors.dominants, 
                            colors.chromas, 
                            colors.achromas, 
                            colors.highSaturates);
        parts = ret.parts;
        components = ret.components;
    }
}
//}())