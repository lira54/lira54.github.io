ymaps.ready(loadPolygons);
var myMap;
// var myPolyline;
var gPolygons;

var cStrokeAvail = '#00db2c';
var cStrokeNA = '#FF0000';
var cFillAvail = '#00c72865';
var cFillNA = '#ff660015';

function loadPolygons() {
    console.log('loadPolygons()');
    var xmlhttp = new XMLHttpRequest();
    var url = "../data/estate-private.json";

    xmlhttp.onreadystatechange = function() {
        console.log(xmlhttp.responseText);
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            gPolygons = JSON.parse(xmlhttp.responseText);
            init();
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function addGPolygonsToMap() {
    gPolygons.forEach(function(val, i, array) {
        myMap.geoObjects.add(polyFromMetadata(val));
    });
}

function polyFromMetadata(pMetadata) {
    var statusColor = pMetadata.isAvailable ? cStrokeAvail : cStrokeNA;
    var statusText = pMetadata.isAvailable ? 'Свободен' : 'Продан';
    var statusString = '<font color="' + statusColor + '">' + statusText + '</font>'
    var bCont = '<b><h5>Участок №' + pMetadata.number +
        '</h5></b>\n<h6>Площадь: ' + pMetadata.area + 'м&#178</h6>' +
        '\n<b><h6>' + statusString + '</h6></b>';
    var hCont = 'Участок № ' + pMetadata.number +
        ' | ' + pMetadata.area + 'м&#178 | ' + statusString;

    var stroke = pMetadata.isAvailable ? cStrokeAvail : cStrokeNA;
    var fill = pMetadata.isAvailable ? cFillAvail : cFillNA;
    var poly = new ymaps.Polygon(
        pMetadata.vertices, {
            balloonContent: bCont,
            hintContent: hCont
        }, {
            strokeWidth: 2,
            strokeColor: stroke,
            fillColor: fill,
            hasBalloon: true,
            hasHint: true,
            draggable: false,
        }
    );

    return poly;

}

function animateToLira() {
    var mapCenter = [55.2167720694846, 82.79472452247623];
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
    console.log('init()');

    document.onkeyup = function(e) {
        if (e.ctrlKey && e.keyCode == 'M'.charCodeAt(0)) {
            console.log('next!');
            onNextPoly();
        } else if (e.ctrlKey && e.key == 'Enter') {
            console.log('next!');
            onNextPoly();
        } else if (e.key == 'Escape') {
            if (gYmapsPolygon) {
                gYmapsPolygon.editor.stopDrawing();
                gYmapsPolygon.editor.stopEditing();
            }
        }
        console.log(e);
    };

    myMap = new ymaps.Map("map", {
        center: [55.030199, 82.92043],
        zoom: 17,
        type: 'yandex#hybrid',
        avoidFractionalZoom: false,
        restrictMapArea: true
    });

    myMap.behaviors.disable('rightMouseButtonMagnifier');

    myMap.controls
        .remove('zoomControl')
        .remove('mapTools')
        .remove('miniMap')
        .remove('searchControl')
        .remove('smallZoomControl')
        .remove('trafficControl')
        .remove('typeSelector');

    addGPolygonsToMap();

    setTimeout(animateToLira, 700);
}
