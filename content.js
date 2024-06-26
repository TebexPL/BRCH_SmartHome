


import {isLoggedIn} from './middleware.js'
import {client} from './index.js'
import {hasSpecialChars} from './auth.js'
import bodyParser from 'body-parser';

const convertSensors = (nums) => {
  let separated_str = [];
  let good_sensors =[];
  if (nums.length === 0) {
    return [0,0,0,0,0];
  }
  separated_str = nums.match(/\d{1,4}/g);
  for (let i = 0; i < separated_str.length; i++) {
    good_sensors.push(parseInt(separated_str[i])/10);
  }
  good_sensors[4] = good_sensors[4]/10;
  return good_sensors;
}

export const content = (app) => {
  let sensors = 0;
  let prettySensors = [];
  let leds = [{name: 'Kuchnia', r: 255, g:0, b:0, br:255},
              {name: 'Salon', r:0, g:255, b:0, br:255},
              {name: 'Łazienka', r:0, g:0, b:255, br:255},
              {name: 'Pokój', r:0, g:255, b:0, br:255}]
  let leds_to_esp = [];
  let leds_in_room = [];

  app.get('/api/content/leds', async (req, res, next) => {

    try{
      const dbResponse = await client.query(`

      SELECT
        name,
        brightness,
        red,
        green,
        blue
      FROM rooms
      ORDER BY name DESC


      `);

      //console.log(dbResponse.rows);

      for (let i = 0; i < dbResponse.rows.length; i++) {
        leds_in_room.push(dbResponse.rows[i].red, dbResponse.rows[i].green, dbResponse.rows[i].blue, dbResponse.rows[i].brightness);
        leds_to_esp.push(leds_in_room);
        leds_in_room = [];
      }
      res.body = "";
      for (let i = 0; i < leds_to_esp.length; i++) {
        for (let j = 0; j < leds_to_esp[i].length; j++) {
          res.body += String(leds_to_esp[i][j]).padStart(3, '0');

        }
      }
        leds_to_esp = []


      res.status(200).send(res.body);
    }
    catch(ex){
      console.log(ex);
      res.status(404).send();
    }
  });

  app.post('/api/content/leds', async (req, res, next) => {
    try{
      if(req.body[0] == null)
        return;

      let rooms = [{name: 'Kuchnia', r: req.body[0].r, g:req.body[0].g, b:req.body[0].b, br:Math.floor(req.body[0].a*255)},
                    {name: 'Salon', r:req.body[1].r, g:req.body[1].g, b:req.body[1].b, br:Math.floor(req.body[1].a*255)},
                    {name: 'Łazienka', r:req.body[2].r, g:req.body[2].g, b:req.body[2].b, br:Math.floor(req.body[2].a*255)},
                    {name: 'Pokój', r:req.body[3].r, g:req.body[3].g, b:req.body[3].b, br:Math.floor(req.body[3].a*255)}]


      for(let room of rooms){
        const dbResponse = await client.query(`

        UPDATE rooms
          SET
          brightness = $1,
          red = $2,
          green = $3,
          blue = $4
        WHERE
        name=$5
        `,[room.br, room.r, room.g, room.b, room.name]);

      }

      res.status(200).send();

    }
    catch(ex){
      console.log(ex);
      res.status(404).send();
    }
  });


  app.get('/api/content/sensors', async (req, res, next) => {
    try{
      const dbResponseRooms = await client.query(`

        SELECT
        name,
        temperature
        FROM rooms
      `);



      const dbResponseSolar = await client.query(`


        SELECT
          timestamp,
          value
        FROM
          solar
       ORDER BY timestamp DESC
       LIMIT 1


      `)


      //W dbResponseRooms powinnaś mieć coś w rodzaju 4 obiektów z nazwami pokoi i wartościami
      //W dbResponseSolar powinnaś mieć tablicę timestampów i wartości o tej godzine
      //Do output trzeba coś skompletować z tych danych
      const output = {temps: dbResponseRooms.rows, solar: dbResponseSolar.rows[0]};
      res.status(200).send(output);

    }
    catch(ex){
      console.log(ex);
      res.status(404).send();
    }
  });


  app.post('/api/content/sensors', async (req, res, next) => {
    sensors = req.body.sensors;
    prettySensors = convertSensors(sensors);

    try{
      let rooms = [{name: 'Kuchnia', temp:prettySensors[0]},
                    {name: 'Salon', temp:prettySensors[1]},
                    {name: 'Łazienka',temp:prettySensors[2]},
                    {name: 'Pokój', temp:prettySensors[3]}]


      let solar = {timestamp: (new Date(Date.now())).toUTCString(), value: prettySensors[4]};


      for(let room of rooms){

        const dbResponse = await client.query(`

          UPDATE
          rooms
          SET
          temperature=$1
          WHERE
          name=$2
        `,[room.temp, room.name]);

      }
      const dbResponse = await client.query(`

      INSERT INTO
      solar(timestamp, value)
      VALUES($1, $2)
      `,[solar.timestamp, solar.value]);

      res.status(200).send();

    }
    catch(ex){
      console.log(ex);
      res.status(404).send();
    }
  });




}
