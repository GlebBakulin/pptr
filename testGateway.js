const Gateway = require('micromq/gateway');

const app = new Gateway({
  microservices: ['pptr'],
  rabbit: {
    // default: amqp://guest:guest@localhost:5672
    url: process.env.RABBIT_URL,
  },
});

app.post(['/pptr'], async (req, res) => {
  await res.delegate('pptr');
});

app.listen(3000);