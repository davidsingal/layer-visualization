var data = [
  {
    name: 'Land use',
    config: {
      "sql": "SELECT * FROM lc_kenya_2008_full_aggr2",
      "cartocss": `#layer {polygon-fill: ramp([aggr_wr], (#5F4690, #1D6996, #38A6A5, #0f8554, #73AF48, #EDAD08, #E17C05, #CC503E, #94346e, #6F4070, #666666), ("FR-4-Very open trees (40-15% crown cover)", "RL-1-Open to closed herbaceous vegetation", "RL-7-Very open shrubs (40-15% crown cover)", "AG-1-Rainfed herbaceous crop", "FR-3-Open trees (65-40% crown cover)", "BA-Bare areas", "AG-1B-Scattered (in natural vegetation or other) Rainfed herbaceous crop (field density 20-40% of polygon area)", "FR-2-Closed trees", "RL-4-Sparse shrub", "RL-5-Open to closed herbaceous vegetation on temporarily flooded"), "="); } #layer::outline {line-width: 0; line-color: #FFF; line-opacity: 0.5; }`,
      "cartocss_version": "3.0.12"
    }
  }
];

var ACCESS_TOKEN = 'pk.eyJ1Ijoic2VyZ2lvZXN0ZWxsYS1rZW55YSIsImEiOiJjajRwbjV3dXEyejI2MzJwZzRoam9qdW01In0.ZNT4q19nkyNCyeSx9R_Lwg';

function startVis() {
  var map = L.map('map', {
    scrollWheelZoom: true,
    center: [-0.9, 37.067],
    zoom: 7
  });
  var layer;

  // Layer
  function renderLayer(config) {
    if (layer) {
      map.removeLayer(layer);
    }
    cartodb.createLayer(map, {
      'user_name': 'simbiotica',
      type: 'cartodb',
      sublayers: [config],
      extra_params: {
        map_key: ACCESS_TOKEN
      }
    }).addTo(map, 2).done(function(cartoLayer) {
      layer = cartoLayer;
      cartoCSSTextarea.value = config.cartocss;
    });
  }

  // Basemap
  L.tileLayer('https://api.mapbox.com/styles/v1/sergioestella-kenya/cj4pn81li16ou2sp5bax7b4u7/tiles/256/{z}/{x}/{y}?access_token=' + ACCESS_TOKEN, {
    maxZoom: 18
  }).addTo(map, 1);

  // Names
  L.tileLayer('https://api.mapbox.com/styles/v1/sergioestella-kenya/cj5cl676s07wm2rmp25hm24ll/tiles/256/{z}/{x}/{y}@2x?access_token=' + ACCESS_TOKEN, {
    maxZoom: 18
  }).addTo(map, 3);

  // Creating select
  var selectElement = document.getElementById('layerSelector');
  var cartoCSSTextarea = document.getElementById('cartoCSSTextarea');
  var applyBtn = document.getElementById('applyBtn');

  for (var index = 0; index < data.length; index++) {
    var option = document.createElement('option');
    var name = data[index].name;
    option.text = name;
    option.value = name;
    selectElement.appendChild(option);
  }

  selectElement.addEventListener('change', function(e) {
    var value = e.currentTarget.value;
    var layerData = _.findWhere(data, { name: value });
    if (layerData) {
      renderLayer(layerData.config);
    }
  });

  // First layer
  renderLayer(data[0].config);
  cartoCSSTextarea.value = data[0].config.cartocss;

  // Modifying cartocss
  applyBtn.addEventListener('click', function(e) {
    var value = cartoCSSTextarea.value;
    var layerData = _.extend({}, _.findWhere(data, { name: selectElement.value }));
    layerData.config.cartocss = value;
    renderLayer(layerData.config);
  });
}

document.addEventListener('DOMContentLoaded', startVis);
