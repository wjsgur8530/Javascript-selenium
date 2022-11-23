const mysql = require('mysql');  // mysql 모듈 로드
const conn = {  // mysql 접속 설정
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: 'jj119672@@',
    database: 'chungju'
};

module.exports = {
    init: function () {
        return mysql.createConnection(conn);
    },
    connect: function(conn) {
        conn.connect(function(err) {
            if(err) console.error('mysql 연결 오류: ' + err);
            else console.log('mysql 연결 성공');
        });
    }
}