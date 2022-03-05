$.getJSON('config.json', function (data) {

    var floors = document.getElementById('floors');
    var layers = document.getElementById('layers');
    var display = document.getElementById('display');

    var eventHandlers = imgChanger(data);

    // Radio group creation
    var checked = true;
    for (const i in data.floors) {
        var floor = data.floors[i];
        var option = document.createElement('label');
        option.className = 'container';
        option.innerHTML =
            `${floor.alias}<input type="radio" name="floor" id="i-floor-${floor.value}" value="${floor.value}" ${(checked ? 'checked' : '')}><span class="checkmark"></span>`;
        option.querySelector("input").addEventListener("change", eventHandlers.floorToggle);
        option.checked = checked;
        checked = false;
        floors.appendChild(option);
    }

    // Chebox for layers creation
    for (const i in data.modes) {
        var mode = data.modes[i];
        if (mode.alias != null) {
            var option = document.createElement('label');
            option.className = 'container';
            option.innerHTML =
                `${mode.alias}<input type="checkbox" id="i-layer-${mode.value}" value="${mode.value}" checked><span class="checkmark"></span></label>`;

            option.querySelector("input").addEventListener("change", eventHandlers.layerToggle);
            option.checked = true;
            layers.appendChild(option);
        }
    }

    // images creation
    for (const i in data.floors) {
        var floor = data.floors[i];

        // base floor image
        var img = document.createElement('img');
        img.className = 'layer';
        img.src = `./${floor.value}/${floor.value}-img.png`;
        img.id = `img-${floor.value}`;
        display.appendChild(img);

        // layers images
        for (const j in data.modes) {
            var layer = data.modes[j];
            var imgsrc = `./${floor.value}/${floor.value}-${layer.value}.png`;
            // check for existence of layer
            var xhr = new XMLHttpRequest();
            xhr.open('HEAD', imgsrc, false);
            xhr.send();
            if (xhr.status != 404) {
                var img = document.createElement('img');
                img.className = 'layer';
                img.src = imgsrc;
                img.id = `img-${floor.value}-${layer.value}`;
                display.appendChild(img);
            }
        }
    }
    // legend create
    var legend1 = document.createElement('img');
    var legend2 = document.createElement('img');
    legend1.src = './legend/legend-base.png'
    legend2.src = './legend/legend-content.png'
    legend1.className = 'legend';
    legend2.className = 'legend';
    display.appendChild(legend1);
    display.appendChild(legend2);

    document.querySelector("#floors label input").dispatchEvent(new Event('change'));
});

// radio:   id="i-floor-B"          value="B"
// chbox:   id="i-layer-cams"       value="cams"
// img:     id="img-B"  |   id="img-B-cams"

function imgChanger(data) {
    // closure
    var currentFloor = data.floors[0].value;
    var currentLayers = new Map();
    for (const i in data.modes)
        currentLayers.set(data.modes[i].value, true);

    function floorToggle(event) {
        var floor = event.target.value;

        var activeLayers = new Map(currentLayers);

        // turn off all the layers for this floor
        activeLayers.forEach(function(val, key, map){if (map.get(key)) layerToggle({'target':{'value':key}});});

        document.getElementById(`img-${currentFloor}`).style.display = 'none';
        document.getElementById(`img-${floor}`).style.display = 'block';

        currentFloor = floor;
        // restore layers
        activeLayers.forEach(function(val, key, map) {if (map.get(key)) layerToggle({'target':{'value':key}});});
        delete activeLayers;
    }


    function layerToggle(event) {
        var layer = event.target.value;

        currentLayers.set(layer, !currentLayers.get(layer));
        var layerImg = document.getElementById(`img-${currentFloor}-${layer}`);
        if (layerImg){
            layerImg.style.display = currentLayers.get(layer) ? 'block' : 'none';
        }
    }

    return {
        'floorToggle': floorToggle,
        'layerToggle': layerToggle
    };
}