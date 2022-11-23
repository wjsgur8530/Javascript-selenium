const express = require("express");
const app = express();
const PORT = 3000;
const bodyParser = require('body-parser');
const session = require('express-session');
const ejs = require('ejs');
const { callbackify } = require("util");
const db_config = require(__dirname + '/database.js');
const conn = db_config.init();
db_config.connect(conn);

var status_session; // 세션 상태

// ejs 엔진 설정하기
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// bodyParser 정의(POST 데이터 Parsing)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

// 정적 파일 불러오기
app.use(express.static(__dirname + "/static"));

// 메인 페이지
app.get('/', (req, res) => {
  conn.query('SELECT * FROM restaurant', (err, rows) => {
    if(err) throw err;
    else
      conn.query('SELECT * FROM tourlist', (err, cols) => {
        if(err) throw err;
        else
          res.render('index', {status_session: status_session, rows: rows, cols: cols});
      })
  });
  // res.render('index', {status_session: status_session});
})

// ajax Data 값 처리를 위한 메인 페이지 POST
app.post('/', (req, res) => {
  var name = "test";

  conn.query('SELECT idmember from member where id=?', [name], (err, rows) => {
    if(err) throw err;
    else {
      if(req.body.rest_id) {
          console.log("유저ID: " + rows[0].idmember)
          var rest_id = req.body.rest_id;
          var like = req.body.data;
          conn.query('INSERT INTO likey(`idmember`,`idrestaurant`,`like`) VALUES (?,?,?)', [rows[0].idmember,rest_id,like], () => {
            console.log("레스토랑ID:" + rest_id);
            console.log("찜하기:" + like);
        })
      } else {
          console.log("유저ID: " + rows[0].idmember)
          var tour_id = req.body.tour_id;
          var like = req.body.data;
          conn.query('INSERT INTO likey_tourlist(`idmember`,`idtourlist`,`like`) VALUES (?,?,?)', [rows[0].idmember,tour_id,like], () => {
            console.log("관광지ID:" + tour_id);
            console.log("찜하기:" + like);
        })
      }
    }
  })
})


// 회원가입
app.get('/register', (req, res) => {
  conn.query('SELECT * FROM restaurant', (err, rows) => {
    if(err) throw err;
    else
      conn.query('SELECT * FROM tourlist', (err, cols) => {
        if(err) throw err;
        else
          res.render('register', {status_session: status_session, rows: rows, cols: cols});
      })
  });
})

app.post('/register', (req, res, next) => {
  const param = [req.body.id, req.body.pw, req.body.name]
  conn.query('INSERT INTO member(`id`, `pw`, `name`) VALUES (?,?,?)', param, (err, rows) => {
    if(err) console.log(err)
    else
      res.redirect('/');
  })
})

// 세션 세팅
app.use(session({
  name: "session ID",
  secret: "my key",
  resave: true,
  saveUninitialized: true,
}))

// 로그인
app.get('/login', (req, res) => {
  conn.query('SELECT * FROM restaurant', (err, rows) => {
    if(err) throw err;
    else
      conn.query('SELECT * FROM tourlist', (err, cols) => {
        if(err) throw err;
        else
          res.render('login', {status_session: status_session, rows: rows, cols: cols});
      })
  });
})

app.post('/login', (req, res, next) => {
  var id = req.body.id;
  var pw = req.body.pw;

  if(id && pw) {
    conn.query('SELECT * FROM member WHERE id=? and pw=?', [id, pw], (err, rows, fields) => {
      if(err) throw err;
      if(rows.length > 0) {
        req.session.is_logined = true;
        req.session.name = id;
        req.session.save(() => {
          console.log('로그인 성공, 세션 유지')
          status_session = true;
          conn.query('SELECT * FROM restaurant', (err, rows, fields) => {
            if(err) throw err;
            else
              conn.query('SELECT * FROM tourlist', (err, cols) => {
                if(err) throw err;
                else
                  res.render('index', {status_session: status_session, rows: rows, cols: cols});
                  console.log(rows)
              })
          });
      });
      } else {              
        res.redirect('/login');
      }
    });
  }
});

// 로그아웃
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if(err) throw err;
    else
      console.log('로그아웃, 세션 종료');
      status_session = false;
      conn.query('SELECT * FROM restaurant', (err, rows) => {
        if(err) throw err;
        else
          conn.query('SELECT * FROM tourlist', (err, cols) => {
            if(err) throw err;
            else
              res.render('index', {status_session: status_session, rows: rows, cols: cols});
          })
      });
  })
})

app.get('/tourlist', (req, res) => {
  conn.query('SELECT * FROM restaurant', (err, rows) => {
    if(err) throw err;
    else
      conn.query('SELECT * FROM tourlist', (err, cols) => {
        if(err) throw err;
        else
          res.render('tourlist', {status_session: status_session, rows: rows, cols: cols});
      })
  });
})

app.get('/restaurant', (req, res) => {
  conn.query('SELECT * FROM restaurant', (err, rows) => {
    if(err) throw err;
    else
      conn.query('SELECT * FROM tourlist', (err, cols) => {
        if(err) throw err;
        else
          res.render('restaurant', {status_session: status_session, rows: rows, cols: cols});
      })
  });
})

// MY레스토랑 GET
app.get('/mypage/restaurant=:page', function(req, res) {
  var sql = "SELECT * from likey left join restaurant on likey.idrestaurant=restaurant.idrestaurant where likey.like=1";
  conn.query(sql, function(error, result){
    if(!error){
      if(result.length>0){
        console.log("난 레스토랑");
        // 페이지당 게시물 수
        var page_size = 5;
        // 페이지의 개수 : 화면 하단 페이지 숫자 버튼 개수
        var page_list_size = 5;
        // limit 변수
        var no = '';
        //전체 게시물의 숫자 : 쿼리문 결과수
        var totalPageCount = result.length;
        if(totalPageCount < 0){
          totalPageCount = 0;
        }
        //현제 페이지
        var curPage = req.params.page;
        
        var totalPage = Math.ceil(totalPageCount / page_size);// 전체 페이지수
        var totalSet = Math.ceil(totalPage / page_list_size); //전체 세트수
        var curSet = Math.ceil(curPage / page_list_size) // 현재 셋트 번호
        var startPage = ((curSet - 1) * page_list_size) + 1 //현재 세트내 출력될 시작 페이지
        var endPage = (startPage + page_list_size) - 1; //현재 세트내 출력될 마지막 페이지
        
        //현재페이지가 0 보다 작으면
        if (curPage < 0){
          no = 0;
        }else{
          //0보다 크면 limit 함수에 들어갈 첫번째 인자 값 구하기
          no = (curPage - 1) * page_size;
        }

        var page_date = {
          "curPage": curPage,
          "page_list_size": page_list_size,
          "page_size": page_size,
          "totalPage": totalPage,
          "totalSet": totalSet,
          "curSet": curSet,
          "startPage": startPage,
          "endPage": endPage
        };

        // 추가 쿼리문
        sql += " LIMIT "+no+","+page_size+"";
        console.log("쿼리문 : "+sql)
        conn.query(sql, function(error, result){
          if(!error){
            conn.query('SELECT * FROM restaurant', (err, rows) => {
              if(err) throw err;
              else
                conn.query('SELECT * FROM tourlist', (err, cols) => {
                  if(err) throw err;
                  else
                    res.render('myrestaurant', {status_session: status_session, rows: rows, cols: cols, result: result, pasing: page_date});
                })
            });
          }
        });
      } else{
        var curPage = 0;
        var page_list_size = 0;
        var page_size = 0;
        var totalPage = 0;
        var curSet = 0;
        var startPage = 0;
        var endPage = 0;
        var page_date = {
          "curPage": curPage,
          "page_list_size": page_list_size,
          "page_size": page_size,
          "totalPage": totalPage,
          "totalSet": totalSet,
          "curSet": curSet,
          "startPage": startPage,
          "endPage": endPage
        };
        conn.query('SELECT * FROM restaurant', (err, rows) => {
          if(err) throw err;
          else
            conn.query('SELECT * FROM tourlist', (err, cols) => {
              if(err) throw err;
              else
                res.render('myrestaurant', {status_session: status_session, rows: rows, cols: cols, result: []});
            })
        });
      } 
    } else{
      conn.query('SELECT * FROM restaurant', (err, rows) => {
        if(err) throw err;
        else
          conn.query('SELECT * FROM tourlist', (err, cols) => {
            if(err) throw err;
            else
              res.render('myrestaurant', {status_session: status_session, rows: rows, cols: cols, result: []});
          })
      });
    }
  });
});

// MY레스토랑 POST
app.post('/mypage/restaurant=:page', function(req, res) {
  var sql = "SELECT * from likey left join restaurant on likey.idrestaurant=restaurant.idrestaurant where likey.like=1";
  conn.query(sql, function(error, result){
    if(!error){
      if(result.length>0){
        console.log("야호");
        // 페이지당 게시물 수
        var page_size = 5;
        // 페이지의 개수 : 화면 하단 페이지 숫자 버튼 개수
        var page_list_size = 5;
        // limit 변수
        var no = '';
        //전체 게시물의 숫자 : 쿼리문 결과수
        var totalPageCount = result.length;
        if(totalPageCount < 0){
          totalPageCount = 0;
        }
        //현제 페이지
        var curPage = req.params.page;
        
        var totalPage = Math.ceil(totalPageCount / page_size);// 전체 페이지수
        var totalSet = Math.ceil(totalPage / page_list_size); //전체 세트수
        var curSet = Math.ceil(curPage / page_list_size) // 현재 셋트 번호
        var startPage = ((curSet - 1) * page_list_size) + 1 //현재 세트내 출력될 시작 페이지
        var endPage = (startPage + page_list_size) - 1; //현재 세트내 출력될 마지막 페이지
        
        //현재페이지가 0 보다 작으면
        if (curPage < 0){
          no = 0;
        }else{
          //0보다 크면 limit 함수에 들어갈 첫번째 인자 값 구하기
          no = (curPage - 1) * page_size;
        }

        var page_date = {
          "curPage": curPage,
          "page_list_size": page_list_size,
          "page_size": page_size,
          "totalPage": totalPage,
          "totalSet": totalSet,
          "curSet": curSet,
          "startPage": startPage,
          "endPage": endPage
        };

        // 추가 쿼리문
        sql += " LIMIT "+no+","+page_size+"";
        console.log("쿼리문 : "+sql)
        conn.query(sql, function(error, result){
          if(!error){
            var remove = req.body.rest_id;
            console.log(remove);
            conn.query("DELETE from likey where idrestaurant=?", [remove], (err, result) => {
              if(err) throw err;
              else {
                console.log("삭제 성공")
                conn.query('SELECT * FROM restaurant', (err, rows) => {
                  if(err) throw err;
                  else
                    conn.query('SELECT * FROM tourlist', (err, cols) => {
                      if(err) throw err;
                      else
                        res.render('myrestaurant', {status_session: status_session, rows: rows, cols: cols, result: result, pasing: page_date});
                    })
                });
              }
            })
          }
        });
      }else{
        conn.query('SELECT * FROM restaurant', (err, rows) => {
          if(err) throw err;
          else
            conn.query('SELECT * FROM tourlist', (err, cols) => {
              if(err) throw err;
              else
                res.render('myrestaurant', {status_session: status_session, rows: rows, cols: cols, result: []});
            })
        });
      }
    }else{
      conn.query('SELECT * FROM restaurant', (err, rows) => {
        if(err) throw err;
        else
          conn.query('SELECT * FROM tourlist', (err, cols) => {
            if(err) throw err;
            else
              res.render('myrestaurant', {status_session: status_session, rows: rows, cols: cols, result: []});
          })
      });
    }
  });
});

// MY관광지 GET
app.get('/mypage/tourlist=:page', function(req, res) {
  var sql = "SELECT * from likey_tourlist left join tourlist on likey_tourlist.idtourlist=tourlist.idtourlist where likey_tourlist.like=1";
  conn.query(sql, function(error, result){
    if(!error){
      if(result.length>0){
        console.log("난 관광지");
        // 페이지당 게시물 수
        var page_size = 5;
        // 페이지의 개수 : 화면 하단 페이지 숫자 버튼 개수
        var page_list_size = 5;
        // limit 변수
        var no = '';
        //전체 게시물의 숫자 : 쿼리문 결과수
        var totalPageCount = result.length;
        if(totalPageCount < 0){
          totalPageCount = 0;
        }
        //현제 페이지
        var curPage = req.params.page;
        
        var totalPage = Math.ceil(totalPageCount / page_size);// 전체 페이지수
        var totalSet = Math.ceil(totalPage / page_list_size); //전체 세트수
        var curSet = Math.ceil(curPage / page_list_size) // 현재 셋트 번호
        var startPage = ((curSet - 1) * page_list_size) + 1 //현재 세트내 출력될 시작 페이지
        var endPage = (startPage + page_list_size) - 1; //현재 세트내 출력될 마지막 페이지
        
        //현재페이지가 0 보다 작으면
        if (curPage < 0){
          no = 0;
        }else{
          //0보다 크면 limit 함수에 들어갈 첫번째 인자 값 구하기
          no = (curPage - 1) * page_size;
        }

        var page_date = {
          "curPage": curPage,
          "page_list_size": page_list_size,
          "page_size": page_size,
          "totalPage": totalPage,
          "totalSet": totalSet,
          "curSet": curSet,
          "startPage": startPage,
          "endPage": endPage
        };

        // 추가 쿼리문
        sql += " LIMIT "+no+","+page_size+"";
        console.log("쿼리문 : "+sql)
        conn.query(sql, function(error, result){
          if(!error){
            conn.query('SELECT * FROM restaurant', (err, rows) => {
              if(err) throw err;
              else
                conn.query('SELECT * FROM tourlist', (err, cols) => {
                  if(err) throw err;
                  else
                    res.render('mytourlist', {status_session: status_session, rows: rows, cols: cols, result: result, pasing: page_date});
                })
            });
          }
        });
      } else{
        var curPage = 0;
        var page_list_size = 0;
        var page_size = 0;
        var totalPage = 0;
        var curSet = 0;
        var startPage = 0;
        var endPage = 0;
        var page_date = {
          "curPage": curPage,
          "page_list_size": page_list_size,
          "page_size": page_size,
          "totalPage": totalPage,
          "totalSet": totalSet,
          "curSet": curSet,
          "startPage": startPage,
          "endPage": endPage
        };
        conn.query('SELECT * FROM restaurant', (err, rows) => {
          if(err) throw err;
          else
            conn.query('SELECT * FROM tourlist', (err, cols) => {
              if(err) throw err;
              else
                res.render('mytourlist', {status_session: status_session, rows: rows, cols: cols, result: [], pasing: page_date});
            })
        });
      } 
    } else{
      conn.query('SELECT * FROM restaurant', (err, rows) => {
        if(err) throw err;
        else
          conn.query('SELECT * FROM tourlist', (err, cols) => {
            if(err) throw err;
            else
              res.render('mytourlist', {status_session: status_session, rows: rows, cols: cols, result: []});
          })
      });
    }
  });
});

// MY관광지 POST
app.post('/mypage/tourlist=:page', function(req, res) {
  var sql = "SELECT * from likey_tourlist left join tourlist on likey_tourlist.idtourlist=tourlist.idtourlist where likey_tourlist.like=1";
  conn.query(sql, function(error, result){
    if(!error){
      if(result.length>0){
        console.log("야호");
        // 페이지당 게시물 수
        var page_size = 5;
        // 페이지의 개수 : 화면 하단 페이지 숫자 버튼 개수
        var page_list_size = 5;
        // limit 변수
        var no = '';
        //전체 게시물의 숫자 : 쿼리문 결과수
        var totalPageCount = result.length;
        if(totalPageCount < 0){
          totalPageCount = 0;
        }
        //현제 페이지
        var curPage = req.params.page;
        
        var totalPage = Math.ceil(totalPageCount / page_size);// 전체 페이지수
        var totalSet = Math.ceil(totalPage / page_list_size); //전체 세트수
        var curSet = Math.ceil(curPage / page_list_size) // 현재 셋트 번호
        var startPage = ((curSet - 1) * page_list_size) + 1 //현재 세트내 출력될 시작 페이지
        var endPage = (startPage + page_list_size) - 1; //현재 세트내 출력될 마지막 페이지
        
        //현재페이지가 0 보다 작으면
        if (curPage < 0){
          no = 0;
        }else{
          //0보다 크면 limit 함수에 들어갈 첫번째 인자 값 구하기
          no = (curPage - 1) * page_size;
        }

        var page_date = {
          "curPage": curPage,
          "page_list_size": page_list_size,
          "page_size": page_size,
          "totalPage": totalPage,
          "totalSet": totalSet,
          "curSet": curSet,
          "startPage": startPage,
          "endPage": endPage
        };

        // 추가 쿼리문
        sql += " LIMIT "+no+","+page_size+"";
        console.log("쿼리문 : "+sql)
        conn.query(sql, function(error, result){
          if(!error){
            var remove = req.body.tour_id;
            console.log(remove);
            conn.query("DELETE from likey_tourlist where idtourlist=?", [remove], (err, result) => {
              if(err) throw err;
              else {
                console.log("삭제 성공")
                conn.query('SELECT * FROM restaurant', (err, rows) => {
                  if(err) throw err;
                  else
                    conn.query('SELECT * FROM tourlist', (err, cols) => {
                      if(err) throw err;
                      else
                        res.render('mytourlist', {status_session: status_session, rows: rows, cols: cols, result: result, pasing: page_date});
                    })
                });
              }
            })
          }
        });
      }else{
        conn.query('SELECT * FROM restaurant', (err, rows) => {
          if(err) throw err;
          else
            conn.query('SELECT * FROM tourlist', (err, cols) => {
              if(err) throw err;
              else
                res.render('mytourlist', {status_session: status_session, rows: rows, cols: cols, result: [], pasing: page_date});
            })
        });
      }
    }else{
      conn.query('SELECT * FROM restaurant', (err, rows) => {
        if(err) throw err;
        else
          conn.query('SELECT * FROM tourlist', (err, cols) => {
            if(err) throw err;
            else
              res.render('mytourlist', {status_session: status_session, rows: rows, cols: cols, result: []});
          })
      });
    }
  });
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`Listen : ${PORT}`);
  console.log(__dirname);
});