'use strict';
const express = require('express'),
    router = express.Router(),
    bcrypt = require('bcrypt-node'),
    jwt = require('jsonwebtoken'),
    async = require('async'),
    email_check = require('email-check'),
    email_validator = require('email-validator'),
    email_existence = require('email-existence'),
    multer = require('multer'),
    shortid = require('shortid'),
    db_connection = require('../config/dbconnection.js'),
    socket_server = require('../server.js'),
    // mongojs = require('mongojs'),
    // db = ('chatDb', ['login_info', 'chat']),
    encrypt = require('./encrypt.js');



router.post('/login', (req, res)=>{
    var secret = Math.random().toString(36).substring(7);
    var id;
    async.waterfall([
        function(callback){

            // db.login_info.find({user: req.body.user},callback);


            var sql = 'SELECT * FROM login_info WHERE ?';
            db_connection.query(sql,{user: req.body.user},callback);
        },
        function(doc, fields, callback){
            console.log(doc);
            if(doc.length){
                id = doc[0].id;
                bcrypt.compare(req.body.password, doc[0].password, callback);
            } else {
                res.json({success: false, msg: 'User not registered'});
            }
            
        },
        function(compare, callback){
            if(compare){

                // db.login_info.update({user: req.body.user}, { $set:{ secret: secret, online: 'Y'}}, callback);
                var sql = "UPDATE login_info SET secret = ?,  online = ? WHERE user = ?"; 
                db_connection.query(sql, [secret, 'Y', req.body.user], callback);
            } else {
                res.json({success: false, msg:'password not matched'});
            }
        },
        function(text, fields, callback){
            jwt.sign(req.body, secret, { expiresIn: 60 * 60 }, callback);
        }
    ], (err, token)=>{
        if(!err){
            socket_server.send_user_status(true);
            res.json({success: true, msg:{token: token, id: id}});
            
        } else {
            res.json({success: false, msg:err});
        }
    })
})




router.post('/logout', (req, res)=>{
    // db.login_info.update({user: req.body.user}, {$set:{online: 'N'}}, (err, doc)=>{
    //     if(!err){
    //         res.json({succes : true, msg: doc});
    //     } else {
    //         res.json({succes: false, msg: err});
    //     }
    // })
    var sql = "UPDATE login_info SET online = ? WHERE user = ?"
    db_connection.query(sql, ['N', req.body.user], (err, doc)=>{
        if(!err){
            socket_server.send_user_status(true);
            res.json({succes : true, msg: doc});
        } else {
            res.json({succes: false, msg: err});
        }
    });
})


router.post('/signup', (req, res)=>{
    async.waterfall([
        function(callback){
            email_check(req.body.email, callback).then(function (res) {
                console.log(res);
                callback(null, res);
              })
              .catch(function (err) {
                  console.log('-------------------------------');
                  console.log(err);
                  console.log('-------------------------------');
                res.json({succes: false, msg: err});
            });
        },
        function(check, callback){
            console.log(check);
            if(check){
                // db.login_info.find({email: req.body.email}, callback);
                var sql = 'SELECT * FROM login_info WHERE ?';
                db_connection.query(sql,{email: req.body.email},callback);
            } else {
                res.json({succes: false, msg: 'Please enter valid email'});
            }
            
        },
        function(doc, fields, callback){
            if(doc.length){
                res.json({success: false, msg: 'email already existed'});
            } else {
                // db.login_info.find({user: req.body.user}, callback);
                var sql = 'SELECT * FROM login_info WHERE ?';
                db_connection.query(sql,{user: req.body.user},callback);
            }
        },
        function(doc, fields, callback){
            if(doc.length){
                res.json({success: false, msg: 'user already existed'});
            } else {
                encrypt.encrypt_pwd(req.body.password, callback);
            }
        },
        function(hash, callback){
            var data = {
                user: req.body.user,
                email: req.body.email,
                id: shortid.generate(),
                password: hash
            }
            // db.login_info.insert(data, callback);
            var sql = 'INSERT INTO login_info SET ?';
            db_connection.query(sql, data, callback);
        }

    ],(err, data)=>{
        console.log(err);
        if(!err){
            res.json({success: true, msg:'success'});
        } else {
            res.json({success: false, msg: err});
        }
    });
})

router.post('/forgot-password', (req, res)=>{
    async.waterfall([
        function(callback){
            // db.login_info.find({email: req.body.email}, callback);
            var sql = 'SELECT * FROM login_info WHERE ?';
            db_connection.query(sql,{email: req.body.email},callback);
        },
        function(data, fields, callback){
            if(data.length){
                if(data[0].otp === req.body.otp){
                    encrypt.encrypt_pwd(req.body.password, callback);
                } else {
                    res.json({success: false, msg:'otp not matched'});
                }
            } else {
                res.json({success: false, msg: 'Please enter currect email'});
            }
        },
        function(hash, callback){
            // db.login_info.update({email: req.body.email},{ $set:{ password: hash}}, callback);
            var sql = "UPDATE login_info SET password = ? WHERE email = ?";
            db_connection.query(sql,[hash, req.body.email], callback);
        }
    ], (err, doc)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})

router.put('/change-password', (req, res)=>{
    async.waterfall([
        function(callback){
            // db.login_info.find({user: req.body.user}, callback);
            var sql = 'SELECT * FROM login_info WHERE ?';
            db_connection.query(sql,{user: req.body.user},callback);
        },
        function(doc, fields, callback){
            if(doc.length){
                bcrypt.compare(req.body.old_password, doc[0].password, callback);
            } else {
                res.json({success: false, msg: 'User not registered'});
            }
            
        },
        function(compare, callback){
            if(compare){
                encrypt.encrypt_pwd(req.body.new_password, callback);
            } else {
                res.json({success: false, msg:'old password not matched'})
            }
        }, 
        function(hash, callback){
            // db.login_info.update({user: req.body.user},{$set:{password: hash}}, callback);
            var sql = "UPDATE login_info SET password = ? WHERE user = ?";
            db_connection.query(sql,[hash, req.body.user], callback);
        }
    ], (err, doc)=>{
        if(!err){
            res.json({success: true, msg: 'password changed'});
        } else {
            res.json({success: false, msg: err});
        }
    })
})

router.post('/gen-otp', (req, res)=>{
    console.log('i am calling');
    var gen_random = Math.floor(Math.random()*90000) + 10000;
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
               user: 'XXXXXXXXXXXXXXXXX',
               pass: 'XXXXXXXXXXXXXXXXX'
           }
    });
    
    const mailOptions = {
        from: 'ramarao.g92@gmail.com', // sender address
        to: req.body.email, // list of receivers
        subject: 'Access token', // Subject line
        html: '<p>Your access token is:'+ gen_random +'</p>'// plain text body
    };
    transporter.sendMail(mailOptions, function (err, info) {
        if(!err){
            console.log(info);
            // db.login_info.update({email: req.body.email},{$set:{otp: gen_random}}, callback);
            var sql = "UPDATE login_info SET otp = ? WHERE email = ?";
            db_connection.query(sql, [gen_random, req.body.email], (err, doc, fields)=>{
                console.log('i am also excuted');
                if(!err){
                    res.json({success: true, msg: gen_random});
                } else {
                    res.json({success: false, msg: err});
                }
            })
        }
        else{
            console.log(err);
            res.json({success: false, msg:err});
        }
    });
    
})

var nodemailer = require('nodemailer');


router.post('/sendmail', (req, res)=>{
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
               user: 'ramarao.g92@gmail.com',
               pass: '8500759698'
           }
    });
    
    const mailOptions = {
        from: 'ramarao.g92@gmail.com', // sender address
        to: req.body.to_mail, // list of receivers
        subject: 'Access token', // Subject line
        html: '<p>Your access token is:'+Math.floor((Math.random() * 10000) + 1)+'</p>'// plain text body
    };
    transporter.sendMail(mailOptions, function (err, info) {
        if(!err)
            res.json({success: true, msg: 'mail successfully sent'});
        else{
            console.log(err);
            res.json({success: false, msg:'mail not sent'});
        }
    });
})


var accountSid = 'AC898feab875aab8bf9867c5d5a2a4f681'; // Your Account SID from www.twilio.com/console
var authToken = '809eab3ec1e556bc6e04bd11559e1464';   // Your Auth Token from www.twilio.com/console

var twilio = require('twilio');
var client = new twilio(accountSid, authToken);


router.post('/send-sms', (req, res)=>{
    client.messages.create({
        body: 'Your verification code is '+ Math.floor((Math.random() * 10000) + 1),
        to: req.body.to_mobile,  // Text this number
        from: '+18142610609' // From a valid Twilio number
    }, (err, message)=>{
        if(!err){
            res.json({success: true, msg:message.sid});
        } else {
            res.json({success: false, msg:err});
        }
    })
    // .then((message) => {
    //     if(message.sid){
    //         console.log(message.sid);
    //         res.json({success: true, msg:message.sid});
    //     } else {
    //         res.json({success: false, msg:'message not sent'});
    //     }
        
    // });
})


//mysql querys

router.post('/mysql-order', (req, res)=>{
    var sql = "SELECT * FROM login_info ORDER BY user";
    db_connection.query(sql, (err, response,fields)=>{
        if(!err){
            res.json({success: true, msg:response});
        } else{
            res.json({success: false, msg:err});
        }
    })
})

router.post('/mysql-or', (err, res)=>{
    var sql = "SELECT * FROM login_info WHERE user = 'Rama Rao' OR user='Rama Rao1'";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg:doc});
        } else {
            res.json({success: false, msg: err});
        }
    }) 
})

router.post('/mysql-not', (req, res)=>{
    var sql = "SELECT * FROM login_info WHERE NOT user= 'Rama Rao'";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})

router.post('/mysql-not-null', (req, res)=>{
    var sql = "SELECT * FROM login_info WHERE secret IS NOT NULL";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})

router.post('/mysql-null', (req, res)=>{
    var sql = "SELECT * FROM login_info WHERE secret IS NULL";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})

router.post('/mysql-update', (req, res)=>{
    var sql = "UPDATE login_info SET user='Rama Rao1234' WHERE user='Rama Rao12'";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})

router.post('/mysql-top', (req, res)=>{
    var sql = "SELECT TOP 3 * FROM login_info";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})

router.post('/mysql-min', (req, res)=>{
    var sql = "SELECT MIN(user) AS name FROM login_info";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})
router.post('/mysql-count', (req, res)=>{
    var sql = "SELECT COUNT(user) AS count FROM login_info";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})
router.post('/mysql-like', (req, res)=>{
    var sql = "SELECT * FROM login_info WHERE user LIKE '%1%'";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            console.log(err);
            res.json({success: false, msg: err});
        }
    })
})

router.post('/mysql-in', (req, res)=>{
    var sql = "SELECT * FROM login_info WHERE user IN ('Rama Rao1234', 'Rama Rao1')";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})

router.post('/mysql-alias', (req, res)=>{
    var sql = "SELECT user AS name, secret AS otp  FROM login_info";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})

router.post('/mysql-join', (req, res)=>{
    var sql = "SELECT login_info.user, user_info.user FROM login_info INNER JOIN user_info ON login_info.user=user_info.user";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})

router.post('/mysql-left-join', (req, res)=>{
    var sql = "SElect * FROM login_info LEFT JOIN user_info ON user_info.user=login_info.user";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})

router.post('/mysql-right-join', (req, res)=>{
    var sql = "SELECT * FROM login_info RIGHT JOIN user_info ON login_info.user = user_info.user";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})

router.post('/mysql-full-join', (req, res)=>{
    var sql = "SELECT * FROM login_info FULL OUTER JOIN user_info ON login_info.user = user_info.user";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})

router.post('/mysql-self-join', (req, res)=>{
    var sql = "SELECT * FROM user_info, login_info WHERE user_info.user = login_info.user";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})
router.post('/mysql-union', (req, res)=>{
    var sql = "SELECT user FROM login_info UNION SELECT * FROM user_info";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})

router.post('/mysql-count-by-user', (req, res)=>{
    var sql = "SELECT COUNT(user), user FROM login_info GROUP BY user";
    // var sql = "SELECT COUNT(user), user FROM login_info GROUP BY user;"
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})

router.post('/mysql-having', (req, res)=>{
    var sql = "SELECT COUNT(user), user FROM login_info GROUP BY user HAVING COUNT (user) > 0";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg:doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})

function* idMaker() {
    var index = 0;
    while(true){
        yield index++;
    }
      
  }
  
  var gen = idMaker();
  console.log(gen);
  console.log(gen.next()); // 0
  console.log(gen.next().value); // 1
  console.log(gen.next().value); // 2
  console.log(gen.next().value);
  // ...
//   for(var  i = 0 ; i<=100; i++){
//       console.log(gen.next().value);
//   }

router.post('/mysql-drop', (req, res)=>{
    var sql = "DROP TABLE userlogin_info";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})

router.post('/mysql-alter', (req, res)=>{
    // var sql = "ALTER TABLE login_info ADD otp varchar(255)";
    var sql = "ALTER TABLE login_info ADD online varchar(255)";
    db_connection.query(sql, (err,doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})
// var sql = "SELECT * FROM login_info";
// db_connection.query(sql, (err, doc, fields)=>{
//     if(!err){
//         console.log(doc);
//     } else {
//         console.log(err);
//     }
// })



router.post('/mysql-ascii', (req, res)=>{
    var sql = "SELECT ASCII(user) AS userOfFirstChar FROM login_info";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, doc: err});
        }
    })
})

router.post('/mysql-charset', (req, res)=>{
    var sql = "SELECT CHAR_LENGTH(user) AS char_length FROM login_info";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})

router.post('/mysql-concat', (req, res)=>{
    var sql = "SELECT CONCAT(user, ' ', 'Rao') AS user_name FROM login_info";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})
router.post('/mysql-format', (req, res)=>{
    var sql = "SELECT FORMAT(123.8345, 1) AS format";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})

router.post('/mysql-insert', (req, res)=>{
    var sql = "SELECT INSERT(' Rama Rao', 1,0, 'Gaddam')";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})

router.post('/mysql-instr', (req, res)=>{
    var sql = "SELECT INSTR('Rama Rao Gaddam', 'G') AS position";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})

router.post('/mysql-lcase', (req, res)=>{
    var sql = "SELECT LCASE('RAMA RAO GADDAM') AS name";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})

router.post('/mysql-left', (req, res)=>{
    var sql = "SELECT LEFT(user, 8) AS NAME FROM login_info";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})
router.post('/mysql-length', (req, res)=>{
    var sql = "SELECT LENGTH(user) AS length FROM login_info";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})

router.post('/mysql-locate', (req, res)=>{
    var sql = "SELECT LOCATE('o', user) AS located FROM login_info";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})

router.post('/mysql-lpad', (req, res)=>{
    var sql = "SELECT LPAD(user, 15, 'Gaddam') AS name FROM login_info";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})

router.post('/mysql-ltrim', (req, res)=>{
    var sql = "SELECT LTRIM(user) AS name FROM login_info";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})

router.post('/mysql-mid', (req, res)=>{
    var sql = "SELECT MID(user, 1, 8) AS name FROM login_info";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})

router.post('/mysql-position', (req, res)=>{
    var sql = "SELECT POSITION('O' IN user) AS position FROM login_info";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})
router.post('/mysql-repeat', (req, res)=>{
    var sql = "SELECT REPEAT(user, 2) AS name FROM login_info";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})

router.post('/mysql-replace', (req, res)=>{
    var sql = "SELECT REPLACE(user, 'Rama Rao', 'Gaddam Rama Rao') AS name FROM login_info";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, doc: err});
        }
    })
})

router.post('/mysql-reverse', (req, res)=>{
    var sql = "SELECT REVERSE(user) AS name FROM login_info";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})
router.post('/mysql-right', (req, res)=>{
    var sql = "SELECT RIGHT(user, 8) AS name FROM login_info";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});   
        }
    })
})
router.post('/mysql-rpad', (req, res)=>{
    var sql = "SELECT RPAD(user, 20, 'Gaddam') AS name FROM login_info";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({succes: false, msg: err});
        }
    })
})

router.post('/mysql-rtrim', (req, res)=>{
    var sql = "SELECT RTRIM(user) AS name FROM login_info";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({succes: true, msg: doc});
        } else {
            res.json({succes: false, msg: err});
        }
    })
})

router.post('/mysql-strcmp', (req, res)=>{
    var sql = "SELECT STRCMP(user, 'Rama Rao') AS status FROM login_info";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({succes: true, msg: doc});
        } else {
            res.json({succes: false, msg: err});
        }
    })
})

router.post('/mysql-substr', (req, res)=>{
    var sql = "SELECT SUBSTR(user, 1,8) AS name FROM login_info";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({succes: true, msg: doc});
        } else {
            res.json({succes: false, msg: err});
        }
    })
})

router.post('/mysql-substring_index', (req, res)=>{
    var sql = "SELECT SUBSTRING_INDEX(user, '' 2) AS name FROM login_info";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({succes: true, msg: doc});
        } else {
            res.json({succes: false, msg: err});
        }
    })
})

router.post('/mysql-add-date', (req, res)=>{
    var sql = "SELECT ADDDATE('1992-07-10', INTERVAL 10 DAY) AS added_date";
    // var sql = "SELECT ADDDATE('2017-06-15', INTERVAL 10 DAY)";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({succes: true, msg: doc});
        } else {
            res.json({succes: false, doc: err});
        }
    })
})

router.post('/mysql-current-date', (req, res)=>{
    var sql = "SELECT CURRENT_TIMESTAMP AS Date";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({succes: true, msg: doc});
        } else {
            res.json({succes: false, msg: err});
        }
    });
})

router.post('/mysql/create-table', (req, res)=>{
    var sql = "CREATE TABLE chat_box(msg varchar(255),from_user varchar(255), to_user varchar(255))";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({succes: true, msg: doc});
        } else {
            res.json({succes: false, msg: err});
        }
    })
})

router.post('/mysql/delete-table', (req, res)=>{
    var sql = "DELETE FROM login_info WHERE user= ? ";
    db_connection.query(sql, ['Rama Rao1234'],(err, doc, fields)=>{
        if(!err){
            res.json({succes: true, msg: doc});
        } else {
            res.json({succes: false, msg: err});
        }
    })
})

console.log(email_validator.validate("ramarao.gaddam@uandme.org")); 
email_existence.check('ramarao.g92@gmail.com', (err, doc)=>{
    if(!err){
        console.log(doc);
    } else {
        console.log(err);
    }
});



var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './my-uploads/')
    },
    filename: function (req, file, cb) {
        console.log(file);
      cb(null, file.originalname)
    }
  })
   
var upload = multer({ storage: storage })
router.post('/fileupload', upload.array('file', 1), (req, res)=>{
    console.log(req.file);
    // upload((err, file)=>{
    //     if(!err){
    //         console.log(file);
    //     } else {
    //         console.log(err);
    //     }
    // })
    // console.log(req.body);
    // console.log(req.file);
    // upload((err, file)=>{
    //     if(!err){
    //         console.log(file);
    //         res.json(file)
    //     } else {
    //         console.log(err);
    //         res.json(err);
    //     }
    // })
    console.log(req.body);
    res.json(req.files);
})

module.exports = router;