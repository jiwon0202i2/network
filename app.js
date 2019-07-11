var express    = require('express');
var mysql      = require('mysql');
var dbConfig   = require('./config/database.js');
var path = require('path');
var bodyParser = require('body-parser');
// var ejs = require('ejs');

var loginRouter = require('./routes/login');
var postRouter = require('./routes/post');

var app = express();

var dbOptions = {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database
};

var conn = mysql.createConnection(dbOptions);
conn.connect();

app.use(express.static(path.join(__dirname+'/public')));

app.set('view engine', 'ejs');
app.set('views', './views');

// app.use('/',loginRouter);

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', loginRouter);
app.use('/login', loginRouter);
app.use('/PostUp', postRouter);
app.use('/main', postRouter);


app.get('/SignUp',function(req, res){
    res.render('SignUp');
});

app.get('/main',function(req, res){
    res.render('main');
});

app.post('/main',function(req, res){
    res.render('main');
});

app.get('/friend',function(req, res){
    res.render('Friend');
});

app.listen(5000, function(){
    console.log("5000번 포트에서 대기중")
});
