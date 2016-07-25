Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}

ymaps.ready(init);
var myMap;
var myPolyline;
var gPolygons;
var gYmapsPolygon;

function loadPolygons() {
    console.log('loadPolygons()');
    var xmlhttp = new XMLHttpRequest();
    var url = "polygons.json";

    xmlhttp.onreadystatechange = function() {
        console.log(xmlhttp.responseText);
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            gPolygons = JSON.parse(xmlhttp.responseText);
//             init();
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function polyFromMetadata(pMetadata) {
    var bCont = '<b>' + pMetadata.title +
        '<\b><br>Площадь: ' + pMetadata.area +
        '<br>Статус: ' + pMetadata.status;
    var stroke = pMetadata.isAvailable ? '#00FF00' : '#FF0000';
    var fill = pMetadata.isAvailable ? '#00ff0015' : '#ff660015';
    var poly = new ymaps.Polygon(
        pMetadata.vertices, {
            balloonContent: bCont,
            hintContent: bCont
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

function savePolygonArray() {
    // Put the object into storage
    localStorage.setObject('gPolygons', gPolygons);
}

function loadPolygonArray() {
    gPolygons = localStorage.getObject('gPolygons') || [];
}

function getCurrentPoly() {
    var value = document.getElementById('polydata').value;
    return value && JSON.parse(value);
}

function setCurrentPoly(obj) {
    document.getElementById('polydata').value = JSON.stringify(obj, null, '  ');
}

function updatePoly() {
    var coords = gYmapsPolygon.geometry.getCoordinates();
    var poly = getCurrentPoly();
    poly.vertices = coords;
    setCurrentPoly(poly);
}

function checkPolyFilled(poly) {
    return poly && poly.number > 0
//         && '' !== poly.status
        && '' !== poly.area
        && poly.vertices && poly.vertices.length > 0 && poly.vertices[0].length > 3;
}

function onNextPoly() {
    var curPoly = getCurrentPoly();
    if (curPoly && curPoly != {}) {
        updatePoly(); // in case we deleted a vertex -- it doesn't cause an update
        if (!checkPolyFilled(curPoly)) {
            alert('Poly not filled!');
            return;
        }
        gPolygons.push(curPoly);
        savePolygonArray();
        console.log('Saved poly: ' + JSON.stringify(curPoly, null, '  '));
    } else {
        console.log('no curPoly');
    }
    if (gYmapsPolygon) {
        gYmapsPolygon.editor.stopDrawing();
        gYmapsPolygon.editor.stopEditing();
    }
    setCurrentPoly({
        "number": (gPolygons.length + 1) || 1, // 1-based
        "status": null,
        "isAvailable": true,
        "area": curPoly.area || 1000,
        "vertices": [
        ]
    });
    var stroke = '#00FFaa';
    var fill = '#00ff5515';
    gYmapsPolygon = new ymaps.Polygon([], {}, {
        editorDrawingCursor: "crosshair",
        editorMaxPoints: 15,
        fillColor: fill,
        strokeColor: stroke,
        strokeWidth: 2
    });

    myMap.geoObjects.add(gYmapsPolygon);

    var stateMonitor = new ymaps.Monitor(gYmapsPolygon.editor.state);
    stateMonitor.add("drawing", function(newValue) {
        gYmapsPolygon.options.set("strokeColor", newValue ? '#FF0000' : '#0000FF');
    });

    gYmapsPolygon.editor.events.add("vertexadd", updatePoly);
    gYmapsPolygon.editor.events.add("vertexdragend", updatePoly);

    gYmapsPolygon.editor.startDrawing();
}

function addGPolygonsToMap() {
//     for (var key in gPolygons) {
//         // skip loop if the property is from prototype
//         if (!gPolygons.hasOwnProperty(key)) continue;

//         var obj = gPolygons[key];
//         myMap.geoObjects.add(polyFromMetadata(obj));
//     }
    gPolygons.forEach(function(val, i, array) {
        // console.log(val);
        myMap.geoObjects.add(polyFromMetadata(val));
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
        zoom: 13,
        type: 'yandex#hybrid',
        avoidFractionalZoom: false,
        restrictMapArea: true
    });

    myMap.behaviors.disable('drag')
        .disable('scrollZoom')
        .disable('dblClickZoom')
        .disable('multiTouch')
        .disable('rightMouseButtonMagnifier');

    myMap.controls.remove('zoomControl')
        .remove('mapTools')
        .remove('miniMap')
        .remove('searchControl')
        .remove('smallZoomControl')
        .remove('trafficControl')
        .remove('typeSelector');
    // var it = myMap.controls.getIterator();
    // var n;
    // do {
    //   n = it.getNext();
    //     console.log(n);
    // } while(n);

//     mapTools miniMap searchControl searchControl typeSelector zoomControl smallZoomControl
//     dblClickZoom multiTouch rightMouseButtonMagnifier

    loadPolygonArray();

    addGPolygonsToMap();
    

    document.getElementById('btn_addpoly').onclick = onNextPoly;

    //     document.getElementById('btn_addpoly').onclick = function() {

    //         var newPoly = {
    //             "number": gPolygons.length,
    //             "title": "участок #" + gPolygons.length,
    //             "status": "Свободен",
    //             "isAvailable": true,
    //             "area": "10 соток",
    //             "vertices": [
    //                 [
    //                   [55.220806154342206, 82.79678102355474],
    //                   [55.22080922100265, 82.79443029933437],
    //                   [55.22081228766281, 82.7944613767193]
    //                 ]
    //             ]
    //         };
    //         myPolyline = polyFromMetadata(newPoly);
    //         myMap.geoObjects.add(myPolyline);

    //         myPolyline.editor.startEditing();
    //         var logPoly = function() {
    //           var coords = myPolyline.geometry.getCoordinates();
    //           newPoly.vertices = coords;
    //           document.getElementById('polydata').value = JSON.stringify(newPoly,null, '  ')
    //         }
    //         myPolyline.editor.events.add("vertexadd", logPoly);
    //         myPolyline.editor.events.add("vertexdragend", logPoly);
    //     };
    // myMap.geoObjects.add(new ymaps.Polygon(
    //     [
    //         [
    //             [55.220806154342206, 82.79678102355474],
    //             [55.22080922100265, 82.79443029933437],
    //             [55.22081228766281, 82.7944613767193],
    //             [55.220815354311604, 82.79446026759581],
    //             [55.22281300865209, 82.79615743832815],
    //             [55.22285988348271, 82.79649124317527],
    //             [55.22242947693308, 82.79664741676278],
    //             [55.222024145512066, 82.79656457101561],
    //             [55.221526812039, 82.79676067500601],
    //             [55.220806154342206, 82.79678102355474]
    //         ]
    //     ], {
    //         balloonContent: '<b>Газонокосилочная трасса</b><br>площадь: 1Га<br> статус: дворянские владения',
    //         hintContent: '<b>Газонокосилочная трасса</b><br>площадь: 1Га<br> статус: дворянские владения'
    //     }, {
    //         strokeWidth: 2,
    //         strokeColor: '#FF0000',
    //         fillColor: '#ff660015',
    //         hasBalloon: true,
    //         hasHint: true,
    //         draggable: false
    //     }
    // ));
    // myPolyline = new ymaps.Polygon(
    //     [
    //         [
    //             [55.220806154342206, 82.79678102355474],
    //             [55.22080922100265, 82.79443029933437],
    //             [55.22081228766281, 82.7944613767193],
    //             [55.220815354311604, 82.79446026759581],
    //             [55.21990945900301, 82.79422833021447],
    //             [55.21684362448681, 82.79517954587308],
    //             [55.21381572962394, 82.79498356997934],
    //             [55.2138613890301, 82.79751726932756],
    //             [55.21530203384407, 82.7971604298389],
    //             [55.21803425501262, 82.7975613672418],
    //             [55.22080462100419, 82.79677945046903],
    //             [55.220806154342206, 82.79678102355474]
    //         ]
    //     ], {
    //         balloonContent: '<b>Пригород</b><br>площадь: 5Га<br> статус: роздано мещанам',
    //         hintContent: '<b>Пригород</b><br>площадь: 5Га<br> статус: роздано мещанам'
    //     }, {
    //         strokeWidth: 2,
    //         strokeColor: '#00FF00',
    //         fillColor: '#00ff0015',
    //         hasBalloon: true,
    //         hasHint: true,
    //         draggable: false
    //     }
    // );
    // myMap.geoObjects.add(myPolyline);



    //     myMap.panTo([55.218465, 82.79613], {
    myMap.panTo([55.21741612765416, 82.79426586473464], {
        duration: 1000
    }).then(function() {
        return myMap.setZoom(18, {
            duration: 300
        });
    });

    // Restore last scroll position
    document.getElementById('main').scrollTop = localStorage.getItem('mainScrollY');
    document.getElementById('main').scrollLeft = localStorage.getItem('mainScrollX');

    document.getElementById('main').onscroll = function() {
        localStorage.setItem('mainScrollX', document.getElementById('main').scrollLeft);
        localStorage.setItem('mainScrollY', document.getElementById('main').scrollTop);
    }

    //myMap.setBounds(myPolyline.geometry.getBounds());

}
