const assert = require('assert');
const _ = require('lodash');

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');

app.disable('x-powered-by');
app.use(bodyParser.json({limit: '2000mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))
app.use(bodyParser.raw({limit: '2000mb'}))
app.use(bodyParser.text({limit: '5000mb', extended: true}))

require('./src/dashboard')(app);
require('./src/api')(app);

app.listen(port, () => console.log(`ItemsAPI listening at http://localhost:${port}`))

