var myMap;
// var myPolyline;
var gPolygons = {};

var cStrokeAvail = '#5cfb00';
var cStrokeNA = '#454545';
var cFillAvail = '#2ccb0035';
var cFillNA = '#45454535';

var cStroke = {
    avail: '#5cfb00',
    na: '#454545',
    ad: '#ff9800',
    //TODO green for ad -- because of the icon
//     ad: '#5cfb00',
    selected: '#00bcd4'
};
var cFill = {
    avail: '#2ccb0035',
    na: '#45454535',
    ad: '#ff980035',
//     ad: '#2ccb0035',
    selected: '#00bcd435'
};

// https://tech.yandex.ru/maps/doc/jsapi/2.0/ref/reference/graphics.style.stroke-docpage/
var cStrokeStyle = {
    avail: 'shortdot',
    na: 'shortdot',
    ad: 'shortdot',
    selected: 'solid'
};
var cStrokeWidth = {
    avail: 2,
    na: 1,
    ad: 2,
    selected: 2
};
var cStat = {
    avail: 'Свободен',
    na: 'Занят',
    ad: 'Объявление',
    selected: null
};
var cStatusColor = {
    avail: '#2ccb00',
    na: cStroke.na,
    ad: cStroke.ad,
    selected: cStroke.selected
};

var polyProvider = (function() {

    function polyFromMetadata(pMetadata) {

        // TODO selected
        var selector = 'na';
        if (pMetadata.isOnSale) {
            selector = 'ad';
        } else if (pMetadata.isAvailable) {
            selector = 'avail';
        }
        var statusColor = cStatusColor[selector];
        var statusText = cStat[selector];
        var statusString = '<font color="' + statusColor + '">' + statusText + '</font>'
        var bCont = '<b><h5>Участок №' + pMetadata.number +
            '</h5></b>\n<h6>' + pMetadata.area + 'м&#178</h6>' +
            '\n<b><h6>' + statusString + '</h6></b>';
        if (pMetadata.ad) {
            bCont += pMetadata.ad.html;
        }
        var hCont = 'Участок № ' + pMetadata.number +
            ' | ' + pMetadata.area + 'м&#178 | ' + statusString;

//         var stroke = cStroke[selector];
//         var fill = cFill[selector];

        
        var stroke = (pMetadata.isAvailable || pMetadata.ad) ? cStroke['avail'] : cStroke['na'];
        var fill = (pMetadata.isAvailable || pMetadata.ad) ? cFill['avail'] : cFill['na'];
        var width = cStrokeWidth[selector];
        var sStyle = cStrokeStyle[selector];
        var poly = new ymaps.Polygon(
            pMetadata.vertices, {
                balloonContent: bCont,
                hintContent: hCont
            }, {
                strokeWidth: width,
                strokeColor: stroke,
                strokeStyle: sStyle,
                fillColor: fill,
                hasBalloon: true,
                hasHint: true,
                draggable: false,
            }
        );

        return poly;
    }

    function loadPolygons(callback) {
        var xmlhttp = new XMLHttpRequest();
        var url = "../data/estate-private.json";

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                callback(JSON.parse(xmlhttp.responseText));
            }
        };
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    }

    function amendWithAds(polyMetadata, adsMarkdown) {
        adsMarkdown.forEach(function(ad, i, adArr) {
            polyMetadata.forEach(function(poly, j, pArr) {
                if (ad.estateNum === poly.number) {
                    poly.isOnSale = true;
                    poly.ad = ad;
                }
            });
        });
    }

    return {
        loadPolygons: loadPolygons,
        amendWithAds: amendWithAds,
        polyFromMetadata: polyFromMetadata
    }
})();

var adProvider = (function() {
    var NUM_CLICKED_PLACEHOLDER = '%NUM_CLICKED_PLACEHOLDER%';
    var _template;
    var _loadTemplate = function(callback) {
        var xmlhttp = new XMLHttpRequest();
        var url = "../ad-template.html";

        // xmlhttp.onreadystatechange = function() {
        //     if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        //         _template = xmlhttp.responseText;
        //         callback();
        //     }
        // };
        // xmlhttp.open("GET", url, true);
        // xmlhttp.send();

        // we don't need the template for now
        callback();
    }

    var _loadAdsTemplateReady = function(callback) {
        showdown.extension('adExt', function() {
            return [{
                type: 'output',
                filter: function(text) {
                    var rPhone = /(\+\d(?:\s?-?\(?\d{3}\)?)(?:\s?-?\d){7}|(?:\d(?:\s?-?\d){6}))/gi;
//                     var rEstateNum = /№(\d*)/gi;
                    var rSqareMetres = /([мМ]\^?2)/gi;
                    var ads = text.split(/<hr\s?\/>\n*/);
                    text = text.replace(rPhone, '<i class="mat-ico-font-align material-icons">&#xE0CD;</i><b>$1</b>');
//                     text = text.replace(rEstateNum, '<a href="#" class="estate-number" onclick="' + NUM_CLICKED_PLACEHOLDER + '($1)">№$1</a>');
                    text = text.replace(rSqareMetres, 'м<sup>2</sup>');

                    return text;
                }
            }]
        });
        // mdHelper.with(['adExt']).load('data/buying-options.md').then(function(responseText) {
        //     document.getElementById('info_panel').innerHTML = responseText;
        //     console.log(responseText);
        // });
        mdHelper.load('data/ads.md').then(function(responseText) {
            var ads = [];
            // var conv = mdHelper.converter(['adExt']);
            var conv = mdHelper.converter(['adExt']);
            var html = conv.makeHtml(responseText);

            var txtSections = html.split(/<hr\s?\/>\n*/);

            // html = "";
            for (i in txtSections) {
                // text.replace(/<h2/gi, '<h2 class="mdl-typography--title"');

                var section = txtSections[i];

                // TODO this is copypaste
                var rEstateNum = /№(\d*)/i;
                var m;
                var newAd = {};
                m = rEstateNum.exec(section)
                newAd.estateNum = parseInt(m[1]); // only capturing group -- the number
                newAd.html = section;
                // TODO
                // View your result using the m-variable.
                // eg m[0] etc.
                // console.log(newAd);


                // section = _template.replace('{{text}}', section);
                // html += section;
                ads.push(newAd);
            }
            // FIXME
            callback(html, ads);
            // document.getElementById('info_panel').innerHTML = responseText;
            // console.log(responseText);
        });
    }

    function loadAds(callback) {
        if (!_template) {
            _loadTemplate(function() {
                _loadAdsTemplateReady(callback);
            });
        } else {
            _loadAdsTemplateReady(callback);
        }
    }

    return {
        NUM_CLICKED_PLACEHOLDER: /%NUM_CLICKED_PLACEHOLDER%/g,
        loadAds: loadAds
    }
})();



function addPolygonsToMap(polyMetadata) {
    polyMetadata.forEach(function(val, i, array) {
        var poly = polyProvider.polyFromMetadata(val);
        gPolygons[val.number] = poly;
        myMap.geoObjects.add(poly);
        //FIXME hack

// TODO show Placemarks after animation is done, otherwise they look weirdly big
        if(val.ad) {
            // https://tech.yandex.ru/maps/jsbox/2.1/placemark_shape
        var polygonLayout = ymaps.templateLayoutFactory.createClass('<div style="text-align:center; postion:relative;"><i style="color:#ff9800;position:absolute;top:-22px; font-size:24px;" class="material-icons">&#xE0C9;</i></div>');
        var placemark = new ymaps.Placemark(centerFromBounds(poly.geometry.getBounds()),
        null, {
            iconLayout: polygonLayout
            // Описываем фигуру активной области "Полигон".
           
        }
        );
        myMap.geoObjects.add(placemark);
        }
    });
}

function animateToLira() {
    var mapCenter = [55.21661196704783, 82.79516775833135];
//     myMap.setCenter(mapCenter);
//     myMap.setZoom(16);
//     return;
    myMap.setZoom(13, {
        duration: 1200
    }).then(function() {
        return myMap.panTo(mapCenter, {
            duration: 2500
        }).then(function() {
            return myMap.setZoom(16, {
                duration: 1200
            });
        })
    });
}

function init() {
    mdHelper.loadAsMarkdown('data/buying-options.md', 'conditions-container');

    myMap = new ymaps.Map("map", {
        center: [55.030199, 82.92043],
        zoom: 17,
        type: 'yandex#hybrid',
        avoidFractionalZoom: false,
        restrictMapArea: true
    });

    myMap.controls
        // .remove('zoomControl')
        .remove('mapTools')
        .remove('miniMap')
        .remove('searchControl')
        .remove('smallZoomControl')
        .remove('trafficControl')
        .remove('typeSelector');
    setTimeout(animateToLira, 700);

    myMap.behaviors.disable('rightMouseButtonMagnifier');
    polyProvider.loadPolygons(function(polyMetadata) {
        // TODO global polyMetadata if neeeded
        adProvider.loadAds(function(html, ads) {
            polyProvider.amendWithAds(polyMetadata, ads);
            html = html.replace(adProvider.NUM_CLICKED_PLACEHOLDER, 'selectPoly');
            addPolygonsToMap(polyMetadata);
        });

    });

}

function centerFromBounds(bounds) {
    return [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2];
}

function selectPoly(numref) {
    // gPolygons[numref].options.set('strokeColor',cStroke['selected']);
    var bounds = gPolygons[numref].geometry.getBounds();
    var center = centerFromBounds(bounds);
    myMap.setCenter(center, 17, {
        duration: 700
    });
}

document.addEventListener("DOMContentLoaded", function(event) {
    ymaps.ready(init);
});
