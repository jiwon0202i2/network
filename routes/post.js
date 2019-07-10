//모듈
const express = require('express');
//express 서버 사용
const app = express();
//app <--tomcat 과 같다고생각하면됨
//모듈 만들기 모듈을 받을땐 모듈이름이 - 으로 연결한다.
const bodyParser = require('body-parser'); 
//폼데이터를 처리할수있다. body-parser은 객체임 함수일수도있지만 객체임


//mysql
const mysql = require('mysql');
//mysql 모듈 사용
//connection 배열?
var dbConfig   = require('../config/database.js');

var dbOptions = {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database
};

var conn = mysql.createConnection(dbOptions);
conn.connect();

const pool = mysql.createPool({
    connectionLimit : 10,
    host : 'localhost',
    user : 'root',
    port : '3306',
    password : '123456',
    database : 'my_db',
    debug : false
})
//mysql 모듈 내 createPoll메서드 호출 : db정보 입력
 
const path = require('path');
//path 모듈 사용 : 파일경로 찾기 post/get ?
//서버설정
app.set('views', 'views');
app.set('view engine', 'ejs');
//ejs 뷰 엔진 사용
 
const static = require('serve-static');
//static 을 설치후 사용하기위해 담아준다. static은 자체가 함수임
 
//정적 미들웨어
app.use(express.static(path.join(__dirname + '/public')));
app.get('/', function(req, res){
    res.render('addBoard');
  });
//post 미들웨어
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
 
//라우터 미들웨어
const router = express.Router();
//라우터 모듈형태로 분리 하려고 만든다!!
 
//start : 라우터 미들웨어 설정(파일:모듈형태로 분리) 라우터를 컨트롤러라 생각해도 무방함 
router.get('/addBoard',(req,res)=>{
    console.log('/addBoard 입력폼 요청');
    res.render('addBoard');
});
//입력액션
router.post('/addBoard',(req,res)=>{
    console.log('/addBoard 입력액션 요청');
    //화면에 입력된 데이터 받기
    const board_pw = req.body.board_pw;
    const board_title = req.body.board_title;
    const board_content = req.body.board_content;
    const board_user = req.body.board_user;
    console.log('board_pw' + board_pw);  
    //db연결
    pool.getConnection((err, conn)=>{
        if(err) throw err;
           //쿼리문 작성, 실행
        conn.query('INSERT INTO board(board_pw,board_title,board_content,board_user,board_date) VALUES(?,?,?,?,now())'
                ,[board_pw , board_title , board_content , board_user], (err, result)=>{
            if(err){
                console.log(err);
                res.end();
           //boardList로 이동요청     
            }else{
                res.redirect('boardList');
            }
        });
    });
});
 
//리스트
router.get('/boardList',(req,res)=>{
    res.redirect('/boardList/1');
    //boardList경로 이동 요청시 boardList/1로 이동 요청.
});
 
router.get('/boardList/:currentPage',(req,res)=>{
    //boardList/currentPage 요청시 처리과정 진행
    console.log('/boardList 요청');
    //페이징    
    let rowPerPage = 10;    // 페이지당 보여줄 글목록 : 10개
    let currentPage = 1;    
    if(req.params.currentPage){    
        currentPage = parseInt(req.params.currentPage);  
    }
    let beginRow =(currentPage-1)*rowPerPage;   
    console.log(`currentPage : ${currentPage}`);
    let model = {};
    //db연결
    pool.getConnection((err, conn)=>{
        //행 개수 구하는 쿼리 실행
        conn.query('SELECT COUNT(*) AS cnt FROM board',(err,result)=>{  //전체 글목록 행 갯수 구하기
            if(err){
                console.log(err);
                res.end();
            }else{
                console.log(`totalRow : ${result[0].cnt}`);
                let totalRow = result[0].cnt;
                lastPage = totalRow / rowPerPage;   
                if(totalRow % rowPerPage != 0){ 
                    lastPage++;
                }
            }
            //쿼리문 작성, 실행, model영역에 세팅, 포워드 방식으로 boardList화면 출력
            conn.query('SELECT idx,board_title,board_user FROM board ORDER BY idx DESC LIMIT ?,?'
                    ,[beginRow,rowPerPage],(err,rs)=>{   
                if(err){   
                    console.log(err);
                    res.end();
                }else{
                    model.boardList = rs;
                    model.currentPage = currentPage;
                    model.lastPage = lastPage;
                    res.render('boardList',{model:model});
                }
            });
        });
    });  
});
 
// 상세내용 보기
router.get('/boardDetail/:idx',(req,res)=>{  
    console.log('/boardDetail 요청');
    console.log(req.params.idx);
    if(!req.params.idx){
        res.redirect('boardList');
    }else{
        pool.getConnection((err, conn)=>{
        conn.query('SELECT idx,board_title,board_content,board_user,board_date FROM board WHERE idx=?'
                ,[parseInt(req.params.idx)],(err,rs)=>{
            if(err){
                console.log(err);
                res.end();
            }else{
                res.render('boardDetail',{boardDetail:rs[0]});
            }
        });
    });
    }
});
 
// 삭제폼(비밀번호 확인을 위한 )
router.get('/deleteBoard/:idx',(req,res)=>{
    console.log('/deleteBoard 삭제 요청');
    const idx = parseInt(req.params.idx);
    console.log(idx);
    res.render('deleteBoard',{deleteBoard:idx});
});
 
// 삭제액션
router.post('/deleteBoard',(req,res)=>{
    console.log('/deleteBoard 삭제 처리');
    const idx = req.body.idx;
    const board_pw = req.body.board_pw;
    pool.getConnection((err, conn)=>{
            conn.query('DELETE FROM board WHERE idx =? AND board_pw=?'
                ,[idx,board_pw],(err,rs)=>{
            if(err){
                console.log(err);
                res.end();
            }else{
                res.redirect('boardList');
            }
        });
    });
});
   
// 수정폼
router.get('/updateBoard/:idx',(req,res)=>{
    console.log('/updateBoard 수정폼 요청');
    const idx = parseInt(req.params.idx);
    console.log(idx);
    pool.getConnection((err, conn)=>{
        conn.query('SELECT idx,board_pw,board_title,board_content,board_user FROM board WHERE idx=?'
                ,[idx],(err,rs)=>{
            if(err){
                console.log(err);
                res.end();
            }else{
                res.render('updateBoard',{updateBoard:rs[0]});
            }
        });
    });
});
// 수정액션
router.post('/updateBoard',(req,res)=>{
    console.log('/updateBoard 수정액션 요청');
    const idx = req.body.idx;
    const board_pw = req.body.board_pw;
    const board_title = req.body.board_title;
    const board_content = req.body.board_content;
    pool.getConnection((err, conn)=>{
        conn.query('UPDATE board SET board_title=?,board_content=? WHERE board_pw=? AND idx=?'
             ,[board_title,board_content,board_pw,idx],(err,rs)=>{
           if(err){
              console.log(err);
              res.end();
          }else{
              res.redirect('boardList');
          }
        });
    });
});
 
app.use('/',router);//실행되면 다시 위로 올라감..
//모든요청에 라우터를 쓸거다!!
//미들웨어 설정 끝
 
//80번 포트 웹서버 구동
app.listen(8080,()=>{
    console.log('8080번 port로 서버실행');
});