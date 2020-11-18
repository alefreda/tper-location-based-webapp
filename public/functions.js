
let numeroAutobus = 0;
let layerIndicazioni, heatLayer, geojsonLayer, clustering;
let latClickFermata = 0;
let lngClickFermata = 0;

function postRequest(url, data) {
  return fetch(url, {
    credentials: 'same-origin', // 'include', default: 'omit'
    method: 'POST', // 'GET', 'PUT', 'DELETE', etc.
    body: JSON.stringify(data), // Coordinate the body type with 'Content-Type'
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
  })
  .then(response => response.json())
}

//mostra i bottoni dopo la scelta del bus
function showButtons() {
  if (layerIndicazioni) {
    layerIndicazioni.remove();
  }
  if (geojsonLayer) {
    geojsonLayer.remove();
  }

  if (!document.getElementById("sceltaNumeroBus").value) {
    document.getElementById("msgErro").innerHTML = `Inserisci il numero dell'autobus!! `;
  } else {
    document.getElementById("msgErro").innerHTML = ``;
    numeroAutobus = document.getElementById("sceltaNumeroBus").value;
    document.getElementById("bottoni").innerHTML = `
<p>Hai scelto il bus numero: ${numeroAutobus}</p>
<input class="btn btn-primary" type="button" value="Visualizza fermate" onclick= "showFermate()">
<input class="btn btn-primary" type="button" value="Visualizza percorso" onclick = "showPercorso()">
<input class="btn btn-primary" type="button" value="Vicino a me" onclick= "showFermateVicino(${Currentlatitude}, ${Currentlongitude})">
<hr>
<input class="btn btn-primary" type="button" value="HeatMap" onclick = "getHeatMap()">
<input class="btn btn-primary" type="button" value="ClusterMarker" onclick = "markercluster()">
<input class="btn btn-primary" type="button" value="GeoFence" onclick= "location.href='geofenceProgetto/index.html'">
<input class="btn btn-primary" type="button" value="K-MEAN" onclick = "location.href='kmeans/index.html'">
<hr>
<input class="btn btn-primary" type="button" value="Live Bus" onclick = "liveBus()">
<input  type="button" class="btn btn-danger" value="Stop Live Bus" onclick = "stopLiveBus()">
`;
  }
}

function showFermate() {
 
  if (geojsonLayer) { geojsonLayer.remove() }
  if (layerIndicazioni) { layerIndicazioni.remove()}
  if (heatLayer) { heatLayer.remove()}
  if (clustering) { clustering.remove()}

  fetch(`/listaFermateBus?number=${numeroAutobus}`)
    .then(response => response.json())
    .then(data => {
      
      //add geoJSON layer
       geojsonLayer= L.geoJSON(data, {
        onEachFeature : onEachFeature
       }).addTo(map);
      
    })
    .catch(error => console.error(error))
}

function showPercorso() {
  if (geojsonLayer) { geojsonLayer.remove() }
  if (layerIndicazioni) { layerIndicazioni.remove()}
  if (heatLayer) { heatLayer.remove()}
  if (clustering) { clustering.remove()}
 

  fetch(`/percorsobus?number=${numeroAutobus}`)
    .then(response => response.json())
    .then(data => {
      //add geoJSON layer
       geojsonLayer= L.geoJSON(data, {
        onEachFeature : onEachFeature
       }).addTo(map);
    })
    .catch(error => console.error(error))
}

function showFermateVicino(lat,lng) {
  if (geojsonLayer) { geojsonLayer.remove() }
  if (layerIndicazioni) { layerIndicazioni.remove()}
  if (heatLayer) { heatLayer.remove()}
  if (clustering) { clustering.remove()}

  fetch(`/fermateVicine?number=${numeroAutobus}&lat=${lat}&lng=${lng}`)
    .then(response => response.json())
    .then(data => {
      //add geoJSON layer
       geojsonLayer=L.geoJSON(data, {
         onEachFeature : onEachFeature
       }).addTo(map);
       
    })
    .catch(error => console.error(error))
}


function onEachFeature(feature, layer) {
  layer.bindPopup(`Fermata autobus: ${numeroAutobus} <button type="button" class="btn btn-info" onclick="indicazioni()">Indicazioni</button>`).on('click', clickPopup)
}

function clickPopup(e) {
  latClickFermata = e.latlng.lat;
  lngClickFermata = e.latlng.lng;  
}

function indicazioni() {
  if (geojsonLayer) {
    geojsonLayer.remove();
  }
  if (layerIndicazioni) {
    layerIndicazioni.remove();
  }
  layerIndicazioni = L.Routing.control({
    waypoints: [
      L.latLng(Currentlatitude, Currentlongitude),
      L.latLng(latClickFermata,lngClickFermata)
    ]
  }).addTo(map);
}

// funzione per test 
function inserisciUserTest(lat,lng) {
  //effettuo post coordinate
  postRequest('/storeCoordinate', {
    lat: lat,
    lng: lng
  })
  .then(data => {
    console.log(data.name);
  }) // Result from the `response.json()` call
  .catch(error => console.error(error))
}


//dinamico, all'aumentare dei punti cambia l'heatmap
/* SERVER risponde 
     [ { st_x: 11.352602004481017, st_y: 44.49365229492848 },
     { st_x: 11.35002708382672, st_y: 44.48899897572312 }
     ]

     heatmap vuole array [[lat,lng],[lat,lng]]
*/
function getHeatMap() {

  if (geojsonLayer) { geojsonLayer.remove() }
  if (layerIndicazioni) { layerIndicazioni.remove()}
  if (heatLayer) { heatLayer.remove()}
  if (clustering) { clustering.remove()}
 

  
  fetch(`/coordinateUtenti`)
  .then(response => response.json())
  .then(data => {
    //array di coordinate
    let arrayHeatMap = [];
    //popolo array
    for (let i = 0; i < data.rows.length; i++) {
      let array = [data.rows[i].st_y, data.rows[i].st_x];
      arrayHeatMap.push(array);
    } 
    heatLayer = L.heatLayer(arrayHeatMap).addTo(map);
    
  })
  .catch(error => console.error(error))
}




//dinamico, all'aumentare dei punti cambia il marker cluster
function markercluster() {
  if (geojsonLayer) { geojsonLayer.remove() }
  if (layerIndicazioni) { layerIndicazioni.remove()}
  if (heatLayer) { heatLayer.remove()}
  if (clustering) { clustering.remove()}

  fetch(`/coordinateUtenti`)
  .then(response => response.json())
  .then(data => {
    //array di coordinate
    let markerclusterArray = [];
    //popolo array
    for (let i = 0; i < data.rows.length; i++) {
      let arraymarker = [data.rows[i].st_y, data.rows[i].st_x];
      markerclusterArray.push(arraymarker);
    } 

    let markers = L.markerClusterGroup();
		
		for (var i = 0; i < markerclusterArray.length; i++) {
			var a = markerclusterArray[i];
			var marker = L.marker(new L.LatLng(a[0], a[1]));
			clustering = markers.addLayer(marker).addTo(map)
		}
    
  })
  .catch(error => console.error(error))
  
}

