const https = require('https');
const id = 'a3929139-7968-47a4-ae07-a659842b3996';
const url = `https://proyecto-ia-production-b7d6.up.railway.app/api/postulaciones/user/${id}`;

https.get(url, (res) => {
  console.log('Status:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Body:', data);
  });
}).on('error', (err) => {
  console.error(err);
});
