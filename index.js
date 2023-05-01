// express
const express = require('express');
const app = express();

// CORS
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

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

// 404
const path = require('path');
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// listen port
let port = 8080;
app.listen(port,()=>{
    console.log("Server is running on: http://localhost:" + port);
})