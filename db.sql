DROP SCHEMA IF EXISTS  sistemiContextAware CASCADE;
CREATE SCHEMA sistemiContextAware;


--TABELLE: 
--tper -> contiene dati forniti dalla tper
--areas -> geofence citta di Bologna
--posizioniUtente -> registra i punti delle posizioni registrate degli utenti


-- TABELLA TPER
CREATE TABLE sistemiContextAware.tper
(
  gid serial NOT NULL,
  codice_linea character varying,
  codice_fermata character varying,
  denominazione character varying,
  ubicazione character varying,
  comune character varying,
  coordinata_x character varying,
  coordinata_y character varying,
  --latitudine double precision,
  --longitudine double precision,
  latitudine character varying,
  longitudine character varying,
  codice_zona character varying,
  the_geom geometry,
  CONSTRAINT tper_pkey PRIMARY KEY (gid),
  CONSTRAINT enforce_dims_the_geom CHECK (st_ndims(the_geom) = 2),
  CONSTRAINT enforce_geotype_geom CHECK (geometrytype(the_geom) = 'POINT'::text OR the_geom IS NULL),
  CONSTRAINT enforce_srid_the_geom CHECK (st_srid(the_geom) = 4326)
);
CREATE INDEX landmarks_the_geom_gist
  ON sistemiContextAware.tper
  USING gist
(the_geom );

-- il problema è che c'è la virgola nel lat e lng ci deve essere il punto, ho risolto facendo il replace della virgola ad un punto e poi ho fatto il casting quando ho 
-- popolato la the_geom

COPY sistemiContextAware.tper(codice_linea,codice_fermata,denominazione,ubicazione,comune,coordinata_x,coordinata_y, latitudine, longitudine, codice_zona)
 FROM 'C:/Users/Public/lineefermate_20191201.csv' DELIMITERS ';' CSV HEADER;

UPDATE sistemiContextAware.tper
    SET latitudine = regexp_replace(latitudine, ',', '.') :: numeric;

UPDATE sistemiContextAware.tper
    SET longitudine = regexp_replace(longitudine, ',', '.'):: numeric;
    

UPDATE sistemiContextAware.tper
SET the_geom = ST_GeomFromText('POINT(' || longitudine :: double precision || ' ' || latitudine :: double precision || ')',4326);


--TABELLA posizioni utente

CREATE TABLE sistemiContextAware.posizioniUtente (
    id SERIAL PRIMARY KEY,
    geom GEOMETRY
);

--TABELLA GEOFENCE
CREATE TABLE sistemiContextAware.areas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64),
    polygon GEOMETRY,
    testo VARCHAR(100)
);

--saragozza
INSERT INTO sistemiContextAware.areas (name, polygon, testo) VALUES (
    'Saragozza',
    (ST_SetSRID(ST_AsText(ST_GeomFromGeoJSON('{
        "type": "Polygon",
        "coordinates": [
          [
            [
              11.327075958251953,
              44.496444108614995
            ],
            [
              11.3124418258667,
              44.495862491863626
            ],
            [
              11.309866905212402,
              44.49191346683554
            ],
            [
              11.312313079833984,
              44.48885202312726
            ],
            [
              11.313300132751465,
              44.48609658639522
            ],
            [
              11.321239471435547,
              44.485729184996416
            ],
            [
              11.330809593200684,
              44.485974119519405
            ],
            [
              11.333255767822266,
              44.489158174729404
            ],
            [
              11.335830688476562,
              44.493260451158825
            ],
            [
              11.327075958251953,
              44.496444108614995
            ]
          ]
        ]
      }')),4326)),
      'Saragozza'
);
--centro
INSERT INTO sistemiContextAware.areas (name, polygon, testo) VALUES (
    'Centro',
    (ST_SetSRID(ST_AsText(ST_GeomFromGeoJSON('{
        "type": "Polygon",
        "coordinates": [
          [
            [
              11.335916519165039,
              44.493352289866166
            ],
            [
              11.34063720703125,
              44.49127057698653
            ],
            [
              11.348490715026855,
              44.48989293201813
            ],
            [
              11.350336074829102,
              44.49078075139257
            ],
            [
              11.351537704467773,
              44.49264818941406
            ],
            [
              11.351065635681152,
              44.4946074043714
            ],
            [
              11.35037899017334,
              44.49668899814321
            ],
            [
              11.347160339355469,
              44.498648077344505
            ],
            [
              11.338534355163574,
              44.49965820183823
            ],
            [
              11.335916519165039,
              44.493352289866166
            ]
          ]
        ]
      }')),4326)),
      'Centro'
);
INSERT INTO sistemiContextAware.areas (name, polygon, testo) VALUES (
    'San Felice',
    (ST_SetSRID(ST_AsText(ST_GeomFromGeoJSON('{
       "type": "Polygon",
        "coordinates": [
          [
            [
              11.335744857788086,
              44.49356657962081
            ],
            [
              11.339349746704102,
              44.50164778981068
            ],
            [
              11.338362693786621,
              44.50274968624234
            ],
            [
              11.335916519165039,
              44.50333123429596
            ],
            [
              11.33437156677246,
              44.503545487379675
            ],
            [
              11.333298683166504,
              44.50323941130474
            ],
            [
              11.328878402709961,
              44.50161718127919
            ],
            [
              11.326689720153809,
              44.49941332478005
            ],
            [
              11.327719688415527,
              44.496444108614995
            ],
            [
              11.335744857788086,
              44.49356657962081
            ]
          ]
        ]
      }')),4326)),
      'San Felice'
);
--Santo Stefano
INSERT INTO sistemiContextAware.areas (name, polygon, testo) VALUES (
    'Santo Stefano',
    (ST_SetSRID(ST_AsText(ST_GeomFromGeoJSON('{
               "type": "Polygon",
        "coordinates": [
          [
            [
              11.336002349853516,
              44.493107386325235
            ],
            [
              11.333341598510742,
              44.48866833139464
            ],
            [
              11.331067085266113,
              44.48585165238646
            ],
            [
              11.335444450378418,
              44.482698035162294
            ],
            [
              11.336946487426758,
              44.47963610776179
            ],
            [
              11.346173286437988,
              44.47917680479181
            ],
            [
              11.349821090698242,
              44.48107523365454
            ],
            [
              11.348748207092285,
              44.48542301539641
            ],
            [
              11.346945762634277,
              44.4898623173159
            ],
            [
              11.340293884277342,
              44.49105627879535
            ],
            [
              11.336002349853516,
              44.493107386325235
            ]
          ]
        ]
      }')),4326)),
      'Santo Stefano'
);
--San Vitale
INSERT INTO sistemiContextAware.areas (name, polygon, testo) VALUES (
    'San Vitale',
    (ST_SetSRID(ST_AsText(ST_GeomFromGeoJSON('{
        "type": "Polygon",
        "coordinates": [
          [
            [
              11.347246170043945,
              44.48977047311279
            ],
            [
              11.349306106567383,
              44.48478005400582
            ],
            [
              11.356258392333984,
              44.484014614538914
            ],
            [
              11.359691619873045,
              44.48585165238646
            ],
            [
              11.358962059020996,
              44.490872594004784
            ],
            [
              11.35810375213623,
              44.49338290273645
            ],
            [
              11.3543701171875,
              44.494301281373104
            ],
            [
              11.352567672729492,
              44.49350535405695
            ],
            [
              11.351194381713867,
              44.490872594004784
            ],
            [
              11.349992752075194,
              44.48931124992784
            ],
            [
              11.347246170043945,
              44.48977047311279
            ]
          ]
        ]
      }')),4326)),
      'San Vitale'
);
--san donato
INSERT INTO sistemiContextAware.areas (name, polygon, testo) VALUES (
    'San Donato',
    (ST_SetSRID(ST_AsText(ST_GeomFromGeoJSON('{
     
        "type": "Polygon",
        "coordinates": [
          [
            [
              11.345787048339844,
              44.504524920020685
            ],
            [
              11.343812942504883,
              44.49959698267009
            ],
            [
              11.34407043457031,
              44.49904600726441
            ],
            [
              11.346302032470703,
              44.49883173764499
            ],
            [
              11.347804069519043,
              44.498678687434754
            ],
            [
              11.348104476928711,
              44.49818892406229
            ],
            [
              11.348748207092285,
              44.497699156575976
            ],
            [
              11.349735260009766,
              44.49748488200713
            ],
            [
              11.350464820861816,
              44.49675022036458
            ],
            [
              11.350979804992674,
              44.49607677239433
            ],
            [
              11.351237297058105,
              44.4948829136959
            ],
            [
              11.351451873779297,
              44.493903319072906
            ],
            [
              11.351666450500488,
              44.49264818941406
            ],
            [
              11.352095603942871,
              44.49292370799464
            ],
            [
              11.352739334106445,
              44.49362780512034
            ],
            [
              11.353211402893066,
              44.494301281373104
            ],
            [
              11.354241371154785,
              44.49436250610131
            ],
            [
              11.35509967803955,
              44.49448495536492
            ],
            [
              11.356730461120605,
              44.49393393165396
            ],
            [
              11.356987953186035,
              44.493842093862604
            ],
            [
              11.358919143676758,
              44.49371964324915
            ],
            [
              11.360163688659668,
              44.493291064077326
            ],
            [
              11.361064910888672,
              44.49564821054552
            ],
            [
              11.361622810363768,
              44.50109683378502
            ],
            [
              11.358404159545898,
              44.502719078289346
            ],
            [
              11.353168487548828,
              44.504953416626705
            ],
            [
              11.346430778503418,
              44.505014630170436
            ],
            [
              11.345787048339844,
              44.504524920020685
            ]
          ]
        ]
      }')),4326)),
      'San Donato'
);
--stazione
INSERT INTO sistemiContextAware.areas (name, polygon, testo) VALUES (
    'Stazione',
    (ST_SetSRID(ST_AsText(ST_GeomFromGeoJSON('{
     
         "type": "Polygon",
        "coordinates": [
          [
            [
              11.333770751953125,
              44.50379034708264
            ],
            [
              11.33613109588623,
              44.503545487379675
            ],
            [
              11.338191032409668,
              44.50323941130474
            ],
            [
              11.339349746704102,
              44.50259664631667
            ],
            [
              11.339821815490723,
              44.50112744258969
            ],
            [
              11.339349746704102,
              44.500331608445244
            ],
            [
              11.339306831359862,
              44.4999642967147
            ],
            [
              11.342096328735352,
              44.49947454414101
            ],
            [
              11.343512535095215,
              44.499627592262186
            ],
            [
              11.344456672668457,
              44.50167839832613
            ],
            [
              11.344757080078125,
              44.50333123429596
            ],
            [
              11.345186233520508,
              44.504984023406585
            ],
            [
              11.346001625061035,
              44.506789794977664
            ],
            [
              11.347246170043945,
              44.50911579117391
            ],
            [
              11.337890625,
              44.510278754464984
            ],
            [
              11.335701942443848,
              44.50978908853912
            ],
            [
              11.33213996887207,
              44.506177675288555
            ],
            [
              11.333770751953125,
              44.50379034708264
            ]
          ]
        ]
      }')),4326)),
      'Stazione'
);
-- Casalecchio
INSERT INTO sistemiContextAware.areas (name, polygon, testo) VALUES (
    'Casalecchio',
    (ST_SetSRID(ST_AsText(ST_GeomFromGeoJSON('{
      
      "type": "Polygon",
        "coordinates": [
          [
            [
              11.273989677429197,
              44.48692323108195
            ],
            [
              11.270127296447752,
              44.48670891691767
            ],
            [
              11.26171588897705,
              44.48539239834804
            ],
            [
              11.26347541809082,
              44.47911556412261
            ],
            [
              11.267509460449219,
              44.468336205159076
            ],
            [
              11.27523422241211,
              44.46842808310802
            ],
            [
              11.288280487060547,
              44.46949998182615
            ],
            [
              11.290769577026367,
              44.470602485685326
            ],
            [
              11.293044090270996,
              44.47351177087768
            ],
            [
              11.29639148712158,
              44.480493463631944
            ],
            [
              11.2939453125,
              44.484749436619964
            ],
            [
              11.28870964050293,
              44.48557610039728
            ],
            [
              11.273989677429197,
              44.48692323108195
            ]
          ]
        ]
      }')),4326)),
      'Casalecchio '
);








WITH ultimaPosizione(geom) AS(
    SELECT geom
    FROM progetto.percorsoutente AS u
    WHERE u.id=( SELECT MAX(id) FROM  sistemiContextAware.percorsoutente  )
)

SELECT name
FROM progetto.areas a, ultimaPosizione u
WHERE ST_Contains(a.polygon,u.geom)




--query geofence QGIS 
WITH geofence(id, number, geom) AS (
  select c.id, count(*) as count, c.polygon
  FROM sistemicontextaware.areas as c join sistemicontextaware.posizioniutente as d On st_within(d.geom, c.polygon)
  GROUP BY c.id, c.polygon
)
SELECT c1.id, c1.number, c1.geom
FROM geofence as c1
WHERE c1.number = ((
  SELECT min(c2.number) as min
  FROM geofence c2
  WHERE c2.id = c1.id));
