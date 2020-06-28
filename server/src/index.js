'use strict';

const createServer = require('./server');
const port = 8200;

createServer()
    .listen(port, () => console.log(`REST API listening on port ${port}!`)).setTimeout(1000 * 60 * 5);