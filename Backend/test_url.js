const fetch = require('node-fetch');
const id = 'a3929139-7968-47a4-ae07-a659842b3996';
const url = `https://proyecto-ia-production-b7d6.up.railway.app/api/postulaciones/user/${id}`;

fetch(url)
  .then(res => {
    console.log('Status:', res.status);
    return res.text();
  })
  .then(body => {
    console.log('Body:', body);
  })
  .catch(err => console.error(err));
