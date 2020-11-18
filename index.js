const { Pool} = require('pg')
const express = require('express');
const app = express();  
path = require('path'); 
const bodyParser = require("body-parser");
const GeoJSON = require('geojson');
const cors = require('cors');

let latBus;
let lngBus;



app.use(cors());

app.use( bodyParser.json() );     
app.use(bodyParser.urlencoded({ extended: true }));
//oppure posso usare direttamente da express
// app.use(express.json());
// app.use(express.urlencoded({ extended: false}));



//carica public file
app.use(express.static(path.join(__dirname, 'public')));


const pool = new Pool({
  user: '',
  host: '',
  database: '',
  password: '',
  port: ,
})



//riceve coordinate e li memorizza nel db
//restituisce la geofence
app.post("/storeCoordinate", async function(req,res){
  res.header("Access-Control-Allow-Origin", "*");
  console.log(`Ricevuto coordinate: ${req.body.lat} || ${req.body.lng}`);
  let update = await inserisci(req.body.lat, req.body.lng);
  res.json(update);
});


//restituisce geojson punti fermate autobus
//query ?number=
app.get("/listaFermateBus", async function(req,res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/json")
  let rows = await listaFermateBus(req.query.number);
  res.send(rows)
})


//restituisce geojson punti percorso utente
//query ?number=
app.get("/percorsobus", async function(req,res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/json")
  let rows = await percorsoBus(req.query.number);
  res.send(rows)
})


//restituisce geojson punti percorso utente
//query ?number= &lat= &lng=
app.get("/fermateVicine", async function(req,res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/json")
  let rows = await fermateVicine(req.query.number,req.query.lat, req.query.lng);
  res.send(rows)
})



//memorizza coordinate Bus per la parte LIVE
app.post("/postCoordinateBus", async function(req,res){
  res.header("Access-Control-Allow-Origin", "*");
  console.log(`Ricevuto coordinate da Autobus: ${req.body.lat} || ${req.body.lng}`);
  latBus = req.body.lat;
  lngBus = req.body.lng;
  res.json("update eseguito con successo!");
});


//fornisce in tempo reale le coordinate del bus LIVE
app.get("/getCoordinateBus", async function(req,res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/json")
  let coordinate = {
    "lat" : latBus,
    "lng" : lngBus
  }
  res.send(coordinate);
})

//fornisce le coordinate dei punti registrati dagli utenti
app.get("/coordinateUtenti", async function(req,res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/json")
  let rows = await pool.query(`SELECT ST_X(geom), ST_Y(geom) FROM sistemicontextaware.posizioniutente`);

  
  res.send(rows)
})






app.listen(3000, function () { console.log('App sulla porta 3000');});

async function percorsoBus(numeroBus) {
  try {
    let results = await pool.query(`SELECT ST_AsGeoJSON(ST_MakeLine(the_geom ORDER BY coordinata_x, coordinata_y)) FROM sistemiContextAware.tper WHERE codice_linea ='${numeroBus}' ;`);
  
    return results.rows[0].st_asgeojson;
  } catch (e) {
    return console.log(e.stack);
  }finally {
    console.log("Connessione col db conclusa con successo!!");
  }
}

//restituisce il geojson contenente i punti delle fermate bus
async function listaFermateBus(numeroBus) {
  try {
    let results = await pool.query(`SELECT ST_AsGeoJSON("the_geom") FROM sistemiContextAware.tper WHERE codice_linea ='${numeroBus}'; `)
    let arrayProva= [];
    let geojson = {};
    for (let index = 0; index < results.rows.length; index++) {
      //lo faccio diventare un oggetto
    let oggettoTemp = JSON.parse(results.rows[index].st_asgeojson)
    
    let oggettoArray = {};
    oggettoArray.lat = oggettoTemp.coordinates[1]
    oggettoArray.lng = oggettoTemp.coordinates[0]
    
      
      //aggiungo all'array l'oggettoArray
      arrayProva.push(oggettoArray);
    }
  
    
    geojson = GeoJSON.parse(arrayProva, {Point: ['lat', 'lng']}); 
   
     
    return geojson
  } catch (e) {
    return console.log(e.stack);
  }
  finally {
    console.log("Connessione al db conclusa con successo!!");
  }
}

//inserisce posizione utente
//controlla geofence
//ritorna eventuale geofence
async function inserisci(lat,lng) {
  try {
    //get random number 0 10
   let random = Math.floor(Math.random() * 11); 


    await pool.query(`INSERT INTO sistemiContextAware.posizioniUtente (geom) VALUES (ST_SetSRID(ST_MakePoint(${lng},${lat}),4326));`);
    //se il punto si trova nel poligono ritorna il nome del poligono
    let res = await  pool.query(` SELECT name FROM sistemiContextAware.areas a WHERE ST_Contains(a.polygon,ST_SetSRID(ST_GeomFromText('POINT(${lng} ${lat})'),4326) )`);
    
    
    //let res = await  pool.query('WITH ultimaPosizione(geom) AS( SELECT geom FROM sistemiContextAware.posizioniUtente AS u WHERE u.id=( SELECT MAX(id) FROM  sistemiContextAware.posizioniUtente  )) SELECT name FROM sistemiContextAware.areas a, ultimaPosizione u WHERE ST_Contains(a.polygon,u.geom)');

    return res.rows[0];
  } catch (error) {
    return console.log(error.stack);
  } finally{
    console.log('inserita posizione utente e verificato geofence con successo!');
  }
}

//fermate vicine alla posizioneUtente
//creo prima un cerchio intorno all'ultima posizione dell'utente storata nel db
// poi cerco tutte le fermate dentro quel cerchio
async function fermateVicine(numeroBus, lat, lng) {
  try {
   /*
      https://www.unitconverters.net/length/earth-s-equatorial-radius-to-kilometer.htm
      SELECT ST_AsGeoJSON(p.the_geom)
      FROM public.tper as p
      WHERE ST_Contains(
        (SELECT ST_Buffer((SELECT geom FROM public.percorsoutente AS u WHERE u.id=( SELECT MAX(id) FROM  public.percorsoutente)), 0.0011, 'quad_segs=8')),
        (p.the_geom)
      )
      */
      /*
      SELECT ST_AsGeoJSON(p.the_geom)
          FROM public.tper as p
          WHERE ST_Contains(
            (SELECT ST_Buffer(ST_GeomFromText('POINT(11.34312629699706 44.4947910773902)', 4326), 0.007, 'quad_segs=8')),
            (p.the_geom)
          ) AND codice_linea ='20'
      */


    let results = await pool.query(`SELECT ST_AsGeoJSON(p.the_geom)
    FROM sistemiContextAware.tper as p
    WHERE ST_Contains(
      (SELECT ST_Buffer(ST_GeomFromText('POINT(${lng} ${lat})', 4326), 0.007, 'quad_segs=8')),
      (p.the_geom)
    ) AND codice_linea ='${numeroBus}' `);

    let arrayProva= [];
    let geojson = {};
    for (let index = 0; index < results.rows.length; index++) {
      //lo faccio diventare un oggetto
    let oggettoTemp = JSON.parse(results.rows[index].st_asgeojson)
    let oggettoArray = {};
    oggettoArray.lat = oggettoTemp.coordinates[1]
    oggettoArray.lng = oggettoTemp.coordinates[0]
      //aggiungo all'array l'oggettoArray
      arrayProva.push(oggettoArray);
    }
    geojson = GeoJSON.parse(arrayProva, {Point: ['lat', 'lng']});  
    return geojson
  } catch (e) {
    return console.log(e.stack);
  }finally {
    console.log("Connessione col db conclusa con successo!!");
  }
}



