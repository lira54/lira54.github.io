ymaps.ready(loadPolygons);
var myMap;
var myPolyline;

function loadPolygons() {
  console.log('loadPolygons()');
    var xmlhttp = new XMLHttpRequest();
    var url = "polygons.json";

    xmlhttp.onreadystatechange = function() {
      console.log(xmlhttp.responseText);
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var myArr = JSON.parse(xmlhttp.responseText);
            init(myArr);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function init(polygons) {
    console.log('init()');
    myMap = new ymaps.Map("map", {
        center: [55.030199, 82.92043],
        zoom: 13,
        type: 'yandex#hybrid'
    });

    polygons.forEach(function(val, i, array) {
        console.log(val);
        var bCont = '<b>' + val.title +
            '<\b><br>Площадь: ' + val.area +
            '<br>Статус: ' + val.status;
            var stroke = val.isAvailable ? '#00FF00' : '#FF0000';
            var fill = val.isAvailable ? '#00ff0015' : '#ff660015';
        myMap.geoObjects.add(new ymaps.Polygon(
            val.vertices, {
                balloonContent: bCont,
                hintContent: bCont
            }, {
                strokeWidth: 2,
                strokeColor: stroke,
                fillColor: fill,
                hasBalloon: true,
                hasHint: true,
                draggable: false
            }
        ));
    });
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

    myMap.panTo([55.218465, 82.79613], {
        duration: 2000
    }).then(function() {
        return myMap.setZoom(15, {
            duration: 600
        });
    });

    // 		myPolyline.editor.startEditing();
    //myMap.setBounds(myPolyline.geometry.getBounds());

}
