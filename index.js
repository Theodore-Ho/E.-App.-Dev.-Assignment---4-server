// express
const express = require('express');
const app = express();

// CORS
const cors = require('cors');
app.use(cors());

// bodyParser
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// static resources
app.use(express.static('./public'));

// index.html page
app.get('/', function getState(req,res) {
    res.setHeader('Content-Type', 'text/html');
    res.send(`index.html`);
})

// custom response
function customResponse(req, res, next) {
    res.result = function(status, msg, data) {
        res.send({
            status: status,
            msg: msg,
            data: data
        });
    }
    next();
}
app.use(customResponse);

// api
const router = require('./src/router');
app.use('/api', router);

// listen port
let port = 8080;
app.listen(port,()=>{
    console.log("Server is running on: http://localhost:" + port);
})