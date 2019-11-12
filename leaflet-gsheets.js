/*Script to display two tables from Google Sheets as point and polygon layers using Leaflet - The Sheets are then imported using Tabletop.js and overwrite the initially laded layers
 */

// init() is called as soon as the page loads
function init() {

  // PASTE YOUR URLs HERE from Google Sheets 'shareable link' form - the first is the workshop 1 layer and the second the workshop 2 layer
  //var workshop1URL = 'https://docs.google.com/spreadsheets/d/17EVLKmK7-52xxPOZUPLp1DiOfY33WOZXrSHjGlZgcqI/edit?usp=sharing';
  var workshop2URL = 'https://docs.google.com/spreadsheets/d/1BaXZIexSQcNDk5lHwxdJJ7ta1lSncUex6eaSvHFQrhQ/edit?usp=sharing';

  //Tabletop.init( { key: workshop1URL,
    //callback: addPolygons,
    //simpleSheet: true } );
  Tabletop.init( { key: workshop2URL,
    callback: addPoints,
    simpleSheet: true } );  // simpleSheet assumes there is only one table and automatically sends its data
}
window.addEventListener('DOMContentLoaded', init);

// Create a new Leaflet map centered on London!
var map = L.map('map').setView([51.5, 0.1], 9);

// This is the Carto Positron basemap
var basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19
});
basemap.addTo(map);

var sidebar = L.control.sidebar({
  container: 'sidebar',
  closeButton: true,
  position: 'left'
}).addTo(map);

panelID = 'my-info-panel'
var panelContent = {
  id: panelID,
  tab: '<i class="fa fa-bars active"></i>',
  pane: '<p id="sidebar-content"></p>',
  title: '<h2 id="sidebar-title">No state selected</h2>',
};
sidebar.addPanel(panelContent);

map.on('click', function (feature, layer) {
  sidebar.close(panelID);
});

// These are declared outisde the functions so that the functions can check if they already exist
//var polygonLayer;
var pointGroupLayer;

// The form of data must be a JSON representation of a table as returned by Tabletop.js
// addPolygons first checks if the map layer has already been assigned, and if so, deletes it and makes a fresh one
// The assumption is that the locally stored JSONs will load before Tabletop.js can pull the external data from Google Sheets
//function addPolygons(data) {
  //if (polygonLayer != null) {
    // If the layer exists, remove it and continue to make a new one with data
    //polygonLayer.remove()
 // }

  // Need to convert the Tabletop.js JSON into a GeoJSON
  // Start with an empty GeoJSON of type FeatureCollection
  // All the rows will be inserted into a single GeoJSON
  //var geojsonStates = {
  //  'type': 'FeatureCollection',
   // 'features': []
  //};

  //for (var row in data) {
    // The Sheets data has a column 'include' that specifies if that row should be mapped
//     if (data[row].include == 'y') {
//       var coords = JSON.parse(data[row].geometry);

//       geojsonStates.features.push({
//         'type': 'Feature',
//         'geometry': {
//           'type': 'MultiPolygon',
//           'coordinates': coords
//         },
//         'properties': {
//           'name': data[row].name,
//           'summary': data[row].summary,
//           'state': data[row].state,
//           'local': data[row].local,
//         }
//       });
//     }
//   }

//   // The polygons are styled slightly differently on mouse hovers
//   var polygonStyle = {'color': '#2ca25f', 'fillColor': '#99d8c9', 'weight': 1.5};
//   var polygonHoverStyle = {'color': 'green', 'fillColor': '#2ca25f', 'weight': 3};

//   polygonLayer = L.geoJSON(geojsonStates, {
//     onEachFeature: function (feature, layer) {
//       layer.on({
//         mouseout: function(e) {
//           e.target.setStyle(polygonStyle);
//         },
//         mouseover: function(e) {
//           e.target.setStyle(polygonHoverStyle);
//         },
//         click: function(e) {
//           // This zooms the map to the clicked polygon
//           // map.fitBounds(e.target.getBounds());

//           // if this isn't added, then map.click is also fired!
//           L.DomEvent.stopPropagation(e);

//           document.getElementById('sidebar-title').innerHTML = e.target.feature.properties.name;
//           document.getElementById('sidebar-content').innerHTML = e.target.feature.properties.summary;
//           sidebar.open(panelID);
//         }
//       });
//     },
//     style: polygonStyle
//   }).addTo(map);
// }

// addPoints is a bit simpler, as no GeoJSON is needed for the points
// It does the same check to overwrite the existing points layer once the Google Sheets data comes along
function addPoints(data) {
  if (pointGroupLayer != null) {
    pointGroupLayer.remove();
  }
  pointGroupLayer = L.layerGroup().addTo(map);

  for(var row = 0; row < data.length; row++) {
    var marker = L.marker([data[row].Latitude, data[row].Longitude]).addTo(pointGroupLayer);

    // UNCOMMENT THIS LINE TO USE POPUPS
    //marker.bindPopup('<h2>' + data[row].location + '</h2>There's a ' + data[row].level + ' ' + data[row].category + ' here');

    // COMMENT THE NEXT 14 LINES TO DISABLE SIDEBAR FOR THE MARKERS
    marker.feature = {
      properties: {
      	Name: data[row].Name,
        Hours: data[row].Hours
        Phone: data[row].Phone
        Email: data[row].Email
        Website: data[row].Website
        Contact Name: data[row].Contact_Name
      }
    };
    marker.on({
      click: function(e) {
        L.DomEvent.stopPropagation(e);
        document.getElementById('sidebar-title').innerHTML = e.target.feature.properties.Name;
        document.getElementById('sidebar-content').innerHTML = e.target.feature.properties.Description;
        sidebar.open(panelID);
      }
    });

    // AwesomeMarkers is used to create fancier icons
    var icon = L.AwesomeMarkers.icon({
      icon: 'info-sign',
      iconColor: 'white',
      markerColor: 'red',
      prefix: 'glyphicon',
      extraClasses: 'fa-rotate-0'
    });
    marker.setIcon(icon);
  }
}

// Returns different colors depending on the string passed
// Used for the points layer
function getColor(type) {
  switch (type) {
    case 'Coffee Shop':
      return 'green';
    case 'Restaurant':
      return 'blue';
    default:
      return 'green';
  }
}
