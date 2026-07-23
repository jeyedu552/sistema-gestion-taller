const http = require('http');

const data = JSON.stringify({
  name: "Test User",
  email: "test" + Date.now() + "@taller.com",
  password: "password123",
  role: "MECANICO"
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/users',
  method: 'OPTIONS'
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
  res.on('end', () => {
    console.log('No more data in response.');
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
