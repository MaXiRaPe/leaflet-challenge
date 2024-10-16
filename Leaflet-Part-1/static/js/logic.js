// Store our API endpoint 

let link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
// Perform a GET request to the query URL/
d3.json(link).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function getColor (d) {
  return (d) > 90 ? '#d73027' :
         (d) > 70 ? '#fc8d59' :
         (d) > 50 ? '#fee08b' :
         (d) > 30 ? '#d9ef8b' :
         (d) > 10 ? '#91cf60' :
         (d) > -10 ? '#1a9850' :  
         '#f0f0f0'; // Default color if none of the conditions are met
}  

function createFeatures(earthquakeData) {

  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><p>${"Magnitude : " + feature.properties.mag}</p><p>${"Depth (km) : " + feature.geometry.coordinates[2]}</p>`);
  }
 
  // Create a GeoJSON layer with the earthquake data
  let earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      // Calculate radius and fillOpacity based on feature properties
      let radius = (feature.properties.mag + 4); // Adjust magnitude scale as needed * 100 / 150
      
      let geojsonMarkerOptions = {
        color: "black",
        fillColor: getColor(feature.geometry.coordinates[2]),
        weight: 0.5,
        opacity: 1,
        radius: radius,
        fillOpacity: 0.8
      };

      return L.circleMarker(latlng, geojsonMarkerOptions);
    },

    onEachFeature: onEachFeature

  }); 
  // Send our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

 // Create the base layers.
 let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

// Create a baseMaps object.
let baseMaps = {
  "Street Map": street
};

// Create an overlay object to hold our overlay.
let overlayMaps = {
  Earthquakes: earthquakes
};

// Create our map, giving it the streetmap and earthquakes layers to display on load.
let myMap = L.map("map", {
  center: [37.09, -95.71],
  zoom: 5,
  layers: [street, earthquakes]
});

let legend = L.control({position: 'bottomright'});

legend.onAdd = function (myMap) {

    let div = L.DomUtil.create('div', 'info legend'),
        grades = [-10, 10, 30, 50, 70, 90],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);

// Create a layer control.
// Pass it our baseMaps and overlayMaps.
// Add the layer control to the map.
// L.control.layers(baseMaps, overlayMaps, {
//   collapsed: true
// }).addTo(myMap);
}
