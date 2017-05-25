const express = require('express');
const app = express();
const cors = require('cors');
const emojiFavicon = require('emoji-favicon');
const fetch = require('node-fetch');

require('dotenv').config();

app.use(cors());
app.use(emojiFavicon('movie_camera'));

const OMDB_API = 'http://www.omdbapi.com';
const cache = {};

function makeRequest(API, req, res, next) {
  const url = `${API}`;
  if(cache[url]) {
    console.log(`serving ${url} from cache`);
    res.json(cache[url]);
  } else {
    console.log(`requesting ${url}`);
    fetch(`${url}&apikey=${process.env.OMDB_API_KEY}`).then(response => {
      if(response.status != 200) {
        console.log(`error ${url} ${response.statusText}`);
        throw new Error(response.statusText);
      }
      return response.json();
    }).then(json => {
      console.log(`caching ${url}`);
      cache[url] = json;
      res.json(json);
    }).catch(next);
  }
}

app.use('/*', (req, res, next) => {
  if(req.originalUrl == '/') {
    res.json({
      title: '🍿 OMDB API 🎥',
      message: 'See http://www.omdbapi.com/ for example usage.'
    });
  } else {
    makeRequest(`${OMDB_API}${req.originalUrl}`, req, res, next);
  }
});

app.use((error, req, res, next) => {
  res.status(res.statusCode || 500);
  res.json({
    message: error.message || '🍿🎥'
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
