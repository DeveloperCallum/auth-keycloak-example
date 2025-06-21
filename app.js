import express from 'express';
import { json } from 'express';
import Keycloak from 'keycloak-connect';
const app = express();
const port = 3000;

// Middleware configuration loaded from keycloak.json file.
const keycloak = new Keycloak({});

app.use(keycloak.middleware());
app.use(express.json())

app.get('/public', (req, res) => {
  res.json({ message: 'public' });
});

app.post('/public/login', (req, res) => {
  fetch('http://127.0.0.1:8180/realms/quickstart/protocol/openid-connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: 'test-cli',
      username: req.body.username,
      password: req.body.password,
      grant_type: 'password'
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const accessToken = data.access_token;
      res.send(data);
      console.log('Access Token:', accessToken);
    })
    .catch(error => {
      console.error('Error fetching token:', error);
      res.send(error);
    }); 
});

app.post('/public/refresh', (req, res) => {
  fetch('http://127.0.0.1:8180/realms/quickstart/protocol/openid-connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: 'test-cli',
      refresh_token: req.body.refresh_token,
      grant_type: 'refresh_token'
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const accessToken = data.access_token;
      res.send(data);
      console.log('Access Token:', accessToken);
    })
    .catch(error => {
      console.error('Error fetching token:', error);
      res.send(error);
    }); 
});


// Protected route
app.get('/user-info', keycloak.protect(), (req, res) => {
  const token = req.kauth.grant.access_token;
  res.json(token.content);
});

app.get('/secured', keycloak.protect('realm:user'), (req, res) => {
  res.json({ message: 'secured' });
});

app.get('/admin', keycloak.protect('realm:admin'), (req, res) => {
  res.json({ message: 'admin' });
});

app.use('*', (req, res) => {
  res.send('Not found!');
});

app.listen(port, () => {
  console.log(`Listening on port ${port}.`);
});
