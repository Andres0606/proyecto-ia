const https = require('https');

const data = JSON.stringify({
  Programa: "Ingenieria de Sistemas",
  Genero: "M",
  Edad: "3",
  Estrato: "Tres",
  EstadoCivil: "Soltero",
  Hijos: "Cero",
  Formacion: "Profesional",
  Emprendimiento: "No",
  TipoOrg: "Privada",
  Area: "Sistemas",
  Tamano: "51 y 200 empleados",
  Sector: "Servicios",
  Ingreso: "3-5 SML"
});

const options = {
  hostname: 'estabilidaduccproyectopython-production.up.railway.app',
  port: 443,
  path: '/predict',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let responseBody = '';
  res.on('data', (d) => { responseBody += d; });
  res.on('end', () => { console.log(responseBody); });
});

req.on('error', (error) => { console.error(error); });
req.write(data);
req.end();
