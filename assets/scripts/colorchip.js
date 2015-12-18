(function() {
    var PI = Math.PI,
        RAD2DEG = 180 / PI,
        DEG2RAD = PI / 180,
        pow = Math.pow,
        round = Math.round,
        cos = Math.cos,
        sin = Math.sin,
        sqrt = Math.sqrt,
        atan2 = Math.atan2;
    
    function roundDecimal(num, count){
        var dec = pow(10, count);
        return round(num*dec)/dec;
    }
    
    function extend(obj) {
        var length = arguments.length;
        if (length < 2 || obj == null) return obj;
        for (var index = 1; index < length; index++) {
            var source = arguments[index];
            for (var key in source) {
                if (obj[key] === void 0) obj[key] = source[key];
            }
        }
        return obj;
    }
    
    // color convert 
    
    function hsv2rgb(h, s, v) {
        var r, g, b;
        if(typeof h === 'object') {
            hsv = h;
            h = hsv.h;
            s = hsv.s;
            v = hsv.v;
        }
        if( s === 0 ) {
            r = g = b = v;
        } else {
            h /= 60;
            var i,
                f, 
                p, 
                q, 
                t;    
            i = h | 0           // Math.floor(h);
            f = h - i;			// factorial part of h
            p = v * ( 1 - s );
            q = v * ( 1 - s * f );
            t = v * ( 1 - s * ( 1 - f ) );
            switch( i ) {
                case 6:
                case 0:
                    r = v;
                    g = t;
                    b = p;
                    break;
                case 1:
                    r = q;
                    g = v;
                    b = p;
                    break;
                case 2:
                    r = p;
                    g = v;
                    b = t;
                    break;
                case 3:
                    r = p;
                    g = q;
                    b = v;
                    break;
                case 4:
                    r = t;
                    g = p;
                    b = v;
                    break;
                case 5:		// case 5:
                    r = v;
                    g = p;
                    b = q;
                    break;
            }
        }
        return {
            r: r * 255,
            g: g * 255,
            b: b * 255,
        }
    }

    function rgb2xyz(r,g,b) {
        if( isObject(r) ){
            g = r.g;
            b = r.b;
            r = r.r;
        }
        function linear(t) {
            if ((t /=255) <= 0.04045) {
                return t / 12.92;
            } else {
                return pow((t + 0.055) / 1.055, 2.4);   
            }
        }
        r = linear(r);
        g = linear(g);
        b = linear(b);
        return {
            x: roundDecimal(0.412456*r + 0.357576*g + 0.180438*b, 6),
            y: roundDecimal(0.212673*r + 0.715152*g + 0.072175*b, 6),
            z: roundDecimal(0.019334*r + 0.119192*g + 0.950304*b, 6)
        }
    }
    function xyz2rgb(x,y,z){
        if( isObject(x) ) {
            y = x.y;
            z = x.z;
            x = x.x;
        }
        var r = roundDecimal(( 3.240454*x + -1.537139*y + -0.498531*z), 6) * 255;
        var g = roundDecimal((-0.969266*x +  1.876011*y +  0.041556*z), 6) * 255;
        var b = roundDecimal(( 0.055643*x + -0.204026*y +  1.057225*z), 6) * 255;
        r = Math.round(r);
        g = Math.round(g);
        b = Math.round(b);
        return {
            r:  r < 256 ? r >= 0 ? r : 0 : 255,
            g:  g < 256 ? g >= 0 ? g : 0 : 255,
            b:  b < 256 ? b >= 0 ? b : 0 : 255
        }

    }
    var CONSTANTS = {
        LAB : {
            Xn: 0.950470,
            Yn: 1,
            Zn: 1.088830,
            t0: 0.008856,
            d: 0.206896,
            k: 903.30
        }
    }   
    function xyz2lab(x,y,z) {
         if( isObject(x) ) {
            y = x.y;
            z = x.z;
            x = x.x;
        }
        function f(t) {
            return t > CONSTANTS.LAB.t0 ? pow(t, 1/3) : (CONSTANTS.LAB.k*t + 16) / 116;
        }
        var fx = f(x/CONSTANTS.LAB.Xn);
        var fy = f(y/CONSTANTS.LAB.Yn);
        var fz = f(z/CONSTANTS.LAB.Zn);
        return {
            l: roundDecimal(116 * fy - 16,   6),
            a: roundDecimal(500 * (fx - fy), 6),
            b: roundDecimal(200 * (fy - fz), 6)
        }
    }
    function lab2xyz(l,a,b) {
        if( isObject(l) ) {
            a = l.a;
            b = l.b;
            l = l.l;
        }
        function r(t) {
            var ttt = t*t*t;
            return ttt > CONSTANTS.LAB.t0 ? ttt : (116 * t - 16) / CONSTANTS.LAB.k;
        }
        var fy = (l+16)/116;
        var fx = fy + (a/500);
        var fz = fy - (b/200);

        return {
            x: roundDecimal(r(fx) * CONSTANTS.LAB.Xn, 6),
            y: roundDecimal(r(fy) * CONSTANTS.LAB.Yn, 6),
            z: roundDecimal(r(fz) * CONSTANTS.LAB.Zn, 6)
        }
    }
    
    function lab2lch(l,a,b) {
        if( isObject(l) ) {
            a = l.a;
            b = l.b;
            l = l.l;
        }

        return {
            l: l,
            c: sqrt(a*a + b*b),
            h: (atan2(b,a)*RAD2DEG + 360) % 360
        }
    }
    
    function lch2lab(l,c,h) {
        if( isObject(l) ) {
            c = l.c;
            h = l.h;
            l = l.l;
        }
        return {
            l: l,
            a: c * cos(h * DEG2RAD),
            b: c * sin(h * DEG2RAD)
        }
    }
    
    function rgb2lch(r, g, b) {
        if(isObject(r)) {
            g = r.g;
            b = r.b;
            r = r.r;
        }
        return lab2lch(xyz2lab(rgb2xyz(r, g, b)));
    }
    
    function lch2rgb(l, c, h) {
        if (isObject(l)) {
            c = l.c;
            h = l.h;
            l = l.l;
        }
        return xyz2rgb(lab2xyz(lch2lab(l, c, h)));
    }
    
    function Book (colors) {
        this.colors = colors;
    }
    
    function isObject (obj) {
        return typeof obj === "object";
    }
    
    Book.prototype.toString = function () {
        var colorsStr = [];
        for (var i = 0; i < this.colors.length; ++i) {
            colorsStr.push(this.colors[i].toString());
        } 
        return colorsStr;
    };
    
    function Chip (r, g, b) {
        if (typeof r === "object") {
            b = r.b;
            g = r.g;
            r = r.r;
        }
        this.r = r;
        this.g = g;
        this.b = b;
    }
    Chip.prototype.toString = function () {
        return this.rgb2Hex(this.r, this.g, this.b);              
    };
    Chip.prototype.rgb2Hex = function (r, g, b) {
        if(typeof r === 'object'){
            g = r.g;
            b = r.b;
            r = r.r;
        }
        function dec2HexStr(d){   
            var hStr = d.toString(16);
            return hStr.length === 1? "0" + hStr : hStr;
        }        
        return "#"+dec2HexStr(r)+dec2HexStr(g)+dec2HexStr(b);
    }
    
//            hex2Rgb : function(hex){    //#ff1234
//            var r = parseInt(hex.slice(1,3),16);
//            var g = parseInt(hex.slice(3,5),16);
//            var b = parseInt(hex.slice(5,7),16);
//            return {r: r, g: g, b: b, a: 1};
//        },

    
    
    
    var colorchip = {
        Book: Book,
        Chip: Chip,
        hsv2rgb: hsv2rgb,
        rgb2xyz: rgb2xyz,
        xyz2rgb: xyz2rgb,
        xyz2lab: xyz2lab,
        lab2xyz: lab2xyz,
        lab2lch: lab2lch,
        lch2lab: lch2lab,
        rgb2lch: rgb2lch,
        lch2rgb: lch2rgb
    };
    
    window.colorchip = colorchip;
}())