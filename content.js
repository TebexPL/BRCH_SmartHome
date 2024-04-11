


import {isLoggedIn} from './middleware.js'
import {client} from './index.js'
import {hasSpecialChars} from './auth.js'


//TODO CONTENT CONTROL

export const content = (app) => {



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
      `);

      console.log(dbResponse.rows);


      res.status(200).send(dbResponse.rows);

    }
    catch(ex){
      console.log(ex);
      res.status(404).send();
    }
  });

  app.post('/api/content/leds', async (req, res, next) => {
    try{



      let rooms = [{name: 'Kuchnia', r: 0, g:0, b:0, br:0},
                     {name: 'Salon', r:0, g:0, b:0, br:0},
                      {name: 'Łazienka', r:0, g:0, b:0, br:0},
                      {name: 'Pokój', r:0, g:0, b:0, br:0}]


    for(let room of rooms){
      const dbResponse = await client.query(`

      UPDATE
        SET
        brightness = $1,
        red = $2,
        green = $3,
        blue = $4
      WHERE
      name=$5
      `,[room.br, room.r, room.g, room.b, rom.name]);

    }

      res.status(200).send(dbResponse.rows);

    }
    catch(ex){
      console.log(ex);
      res.status(404).send();
    }
  });


  app.get('/api/content/temperature', async (req, res, next) => {
    try{
      const dbResponse = await client.query(`

      SELECT
        name,
        temperature
      FROM rooms
      `);

      console.log(dbResponse.rows);


      res.status(200).send(dbResponse.rows);

    }
    catch(ex){
      console.log(ex);
      res.status(404).send();
    }
  });


  app.post('/api/content/temperature', async (req, res, next) => {
    try{
      let rooms = [{name: 'Kuchnia', temp:0},
                     {name: 'Salon', temp:0},
                      {name: 'Łazienka',temp:0},
                      {name: 'Pokój', temp:0}]


    for(let room of rooms){
      const dbResponse = await client.query(`

      UPDATE
        SET
        temperature=$1
      WHERE
      name=$2
      `,[room.temperature, room.name]);

    }



      res.status(200).send(dbResponse.rows);

    }
    catch(ex){
      console.log(ex);
      res.status(404).send();
    }
  });




}
