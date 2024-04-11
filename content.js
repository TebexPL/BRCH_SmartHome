


import {isLoggedIn} from './middleware.js'
import {client} from './index.js'
import {hasSpecialChars} from './auth.js'



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
      //Tutaj masz w dbResponse.rows otrzymane dane.
      //powinnaś Tam mieć coś w rodzaju tablicy obiektów z nazwą pokoju i kolorami itp
      //Trzeba to przekonwertować na tekst żeby ESP mogło zrozumieć
      res.status(200).send(dbResponse.rows);

    }
    catch(ex){
      console.log(ex);
      res.status(404).send();
    }
  });

  app.post('/api/content/leds', async (req, res, next) => {
    try{

      //Tutaj dostajesz z frontu jakie mają być światła, trzeba ustawić wartości liczbowe żeby wpisało do bazy danych

      let rooms = [{name: 'Kuchnia', r: 255, g:0, b:0, br:255},
                    {name: 'Salon', r:0, g:255, b:0, br:255},
                    {name: 'Łazienka', r:0, g:0, b:255, br:255},
                    {name: 'Pokój', r:0, g:255, b:0, br:255}]


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
        `,[room.br, room.r, room.g, room.b, room.name]);

      }

      req.status(200).send();

    }
    catch(ex){
      console.log(ex);
      req.status(404).send();
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

      console.log(dbResponseRooms.rows);


      const dbResponseSolar = await client.query(`


        SELECT
          timestamp,
          value
        FROM
          solar

      `)
      console.log(dbResponseSolar.rows);


      //W dbResponseRooms powinnaś mieć coś w rodzaju 4 obiektów z nazwami pokoi i wartościami
      //W dbResponseSolar powinnaś mieć tablicę timestampów i wartości o tej godzine
      //Do output trzeba coś skompletować z tych danych
      const output = {};
      res.status(200).send(output);

    }
    catch(ex){
      console.log(ex);
      res.status(404).send();
    }
  });


  app.post('/api/content/sensors', async (req, res, next) => {
    try{
      let rooms = [{name: 'Kuchnia', temp:0},
                    {name: 'Salon', temp:0},
                    {name: 'Łazienka',temp:0},
                    {name: 'Pokój', temp:0}]


      let solar = {timestamp: (new Date(Date.now())).toUTCString(), value: 0};


    for(let room of rooms){
      const dbResponse = await client.query(`

        UPDATE
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
