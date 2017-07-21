var data = [
  {
    name: "Livestock",
    config: {
      "sqlFn": (locationId) => `with geom as (select the_geom_webmercator from geometries where id = ${locationId})
SELECT cartodb_id, lvstck_den, st_intersection(s.the_geom_webmercator, (select * from geom))  as  the_geom_webmercator FROM kenya_livestock_1990 s where st_intersects(s.the_geom_webmercator, (select * from geom)) `,
      "cartocss": `#layer {
          polygon-fill: ramp([lvstck_den], (#c9ff8a, #82d091, #FF8800, #19696f, #FF6161), jenks);
          polygon-opacity: 1;
          //line-width: 0.5;
          //line-color: ramp([lvstck_den], (#ff6161, #82d091, #4c9b82, #19696f, #074050), jenks);
          //line-opacity: 1;
        }`,
      "cartocss_version": "3.0.12"
    }
  }, {
    name: "Wild life",
    config: {
      "sqlFn": (locationId) => `with geom as (select the_geom_webmercator from geometries where id = ${locationId})

SELECT cartodb_id, all_wl_den, st_intersection(s.the_geom_webmercator, (select * from geom))  as  the_geom_webmercator FROM ke_wildlife_1990 s where st_intersects(s.the_geom_webmercator, (select * from geom))`,
      "cartocss": `#layer {
  polygon-fill: ramp([all_wl_den], (#fcde9c, #f58670, #e34f6f, #d72d7c, #7c1d6f), jenks);
  line-width: 0.5;
  line-color: ramp([all_wl_den], (#fcde9c, #f58670, #e34f6f, #d72d7c, #7c1d6f), jenks);
  line-opacity: 1;
}`,
      "cartocss_version": "3.0.12"
    }
  }, {
    name: "Land cover",
    config: {
      "sqlFn": (locationId) => `with geom as (select the_geom_webmercator from geometries where id = ${locationId})

SELECT cartodb_id, aggr_wr, st_intersection(s.the_geom_webmercator, (select * from geom))  as  the_geom_webmercator FROM lc_kenya_2008_full_aggr2 s where st_intersects(s.the_geom_webmercator, (select * from geom)) `,
      "cartocss": `#layer {
  polygon-fill: ramp([aggr_wr], (#5F4690, #1D6996, #38A6A5, #0f8554, #73AF48, #EDAD08, #E17C05, #CC503E, #94346e, #6F4070, #666666), ("FR-4-Very open trees (40-15% crown cover)", "RL-1-Open to closed herbaceous vegetation", "RL-7-Very open shrubs (40-15% crown cover)", "AG-1-Rainfed herbaceous crop", "FR-3-Open trees (65-40% crown cover)", "BA-Bare areas", "AG-1B-Scattered (in natural vegetation or other) Rainfed herbaceous crop (field density 20-40% of polygon area)", "FR-2-Closed trees", "RL-4-Sparse shrub", "RL-5-Open to closed herbaceous vegetation on temporarily flooded"), "=");
} `,
      "cartocss_version": "3.0.12"
    }
  }, {
    name: "Choropleth",
    config: {
      "sqlFn": (regionValue) => `SELECT *, random()*1000 as valuese FROM geometries where type = '${regionValue}'`,
      "cartocss": `#layer {
  polygon-fill: ramp([valuese], (#f6d2a9, #f3aa84, #ea8171, #d55d6a, #b13f64), quantiles);
}
#layer::outline {
  line-width: 1;
  line-color: #FFF;
  line-opacity: 0.5;
}  `,
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
  var layer, layerData;

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
      }, 
      https: true
    }, {
      https: true
    }).addTo(map, 2).done(function(cartoLayer) {
      layer = cartoLayer;
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
  var locationSelector = document.getElementById('locationSelector');
  var regionSelector = document.getElementById('regionSelector');
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
    layerData = _.findWhere(data, { name: value });
    if (layerData) {
      cartoCSSTextarea.value = layerData.config.cartocss;
    }
  });

  // First layer
  layerData = _.findWhere(data, { name: selectElement.value });
  cartoCSSTextarea.value = layerData.config.cartocss;

  // Modifying cartocss
  applyBtn.addEventListener('click', function(e) {
    var value = cartoCSSTextarea.value;
    var resultData = Object.assign({}, layerData);
    //if (!layerData) {
    //  layerData = _.extend({}, _.findWhere(data, { name: selectElement.value }));
    //}
    if (resultData.name === 'Choropleth') {
      resultData.config.sql = layerData.config.sqlFn(regionSelector.value);
    } else {
      resultData.config.sql = layerData.config.sqlFn(locationSelector.value);
    }
    resultData.config.cartocss = value;
    renderLayer(resultData.config);
  });
}

document.addEventListener('DOMContentLoaded', startVis);
