// var express    = require('express');
// var mysql      = require('mysql');
// var dbConfig   = require('./config/database.js');
// var path = require('path');
// var bodyParser = require('body-parser');
// var ejs = require('ejs');

// var app = express();

// var dbOptions = {
//     host: dbConfig.host,
//     port: dbConfig.port,
//     user: dbConfig.user,
//     password: dbConfig.password,
//     database: dbConfig.database
// };

// var conn = mysql.createConnection(dbOptions);
// conn.connect();

// app.use(express.static(path.join(__dirname+'/public')));

// app.set('view engine', 'ejs');
// app.set('views', './views');
// app.use(bodyParser.urlencoded({ extended: false }));



var express = require('express');
var router = express.Router();

//=========================================

router.get('/',function(req, res){
    res.render('login', {massage: ''});
});

router.post('/login',function(req, res){
    var id = req.body.loginId;
    var pw = req.body.password;
    conn.query('SELECT * FROM person WHERE user_id=?', [id], function(err, results){
        if(err)
            console.log(err);

        console.log(results);

        if(!results[0]){
            res.render('login', {massage: '아이디 또는 비밀번호가 틀렸습니다'} );
            return console.log('please check your id or pw.');
        }
         
        var user = JSON.stringify(results);

        if(user.includes(pw)){
            console.log('success!');
            return res.redirect('main');
        }else{
            res.render('login', {massage: '아이디 또는 비밀번호가 틀렸습니다'} );
            return console.log('please check your id or pw.');
        }
      });//query
});

module.exports = router;

//==========================

// app.get('/SignUp',function(req, res){
//     res.render('SignUp');
// });

// app.get('/imgUp',function(req, res){
//     res.render('imgUp');
// });

// app.get('/main',function(req, res){
//     res.render('main');
// });

// app.post('/main',function(req, res){
//     res.render('main');
// });

// app.get('/friend',function(req, res){
//     res.render('Friend');
// });

// app.listen(5000, function(){
//     console.log("5000번 포트에서 대기중")
// });