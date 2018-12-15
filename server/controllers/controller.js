'use strict';
const express = require('express'),
      db_connection = require('../config/dbconnection.js'),
      socket_server = require('../server.js'),
      router = express.Router(),
    //   mongojs = require('mongojs'),
    //   db = ('chatDb', ['login_info', 'chat']),
      nodemailer = require('nodemailer');
router.post('/get-data', (req, res)=>{
    res.json({success: true, msg: 'Success123'});
})   

router.post('/msg-post', (req, res)=>{
    console.log(req.body);
    var data = {
        from_user: req.body.user,
        to_user: req.body.to_user,
        msg: req.body.msg,
        img: req.body.img,
        date: req.body.date
    }
    // db.chat.insert(data, (err, doc)=>{
    //     if(!err){
    //         send_msg(req.body);
    //         res.json({success: true, msg: doc});
    //     } else {
    //         res.json({success: false, msg: err});
    //     }
    // })
    var sql = 'INSERT INTO chat_box SET ?';
    db_connection.query(sql, data, (err, doc, fields)=>{
        if(!err){
            send_msg(req.body);
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, msg: err});
        }
    })
})

router.post('/get-msg', (req, res)=>{


    // db.chat.find({$and : [
    //     { $or : [ { to_user : req.body.to_user }, { from_user : req.body.to_user } ] },
    //     { $or : [ { from_user : req.body.user }, { to_user : req.body.user }  ] }
    // ]}, (err, doc)=>{
    //     if(!err){
    //         res.json({success: true, msg: doc});
    //     } else {
    //          res.json({success: false, msg: err});
    //     }
    // })


    var sql = "SELECT * FROM chat_box WHERE (to_user = ?   or from_user= ?) and (from_user = ?   or to_user= ?)";
    db_connection.query(sql, [req.body.to_user, req.body.to_user, req.body.user, req.body.user], (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
             res.json({success: false, msg: err});
        }
    })
})

router.post('/get-users-data', (req, res)=>{

    // db.chat.find({to_user: req.body.user}, (err, doc)=>{
    //     if(!err){
    //         res.json({success: true, msg: doc});
    //     } else {
    //          res.json({success: false, msg: err});
    //     }
    // })




    var sql = "SELECT * FROM chat_box WHERE to_user = ?";
    db_connection.query(sql, req.body.user, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, err});
        }
    })
})

router.post('/get-users', (req, res)=>{

    // db.login_info.find({user: true}, (err, doc)=>{
    //     if(!err){
    //         res.json({success: true, msg: doc});
    //     } else {
    //          res.json({success: false, msg: err});
    //     }
    // })


    var sql = "SELECT user, online, pic FROM login_info";
    db_connection.query(sql, (err, doc, fields)=>{
        if(!err){
            res.json({success: true, msg: doc});
        } else {
            res.json({success: false, err});
        }
    })
})

router.post('/invitefriends', (req, res)=>{
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
               user: 'XXXXXXXXXXXXXXXXXX',
               pass: 'XXXXXXXXXXXXXXXXXX'
           }
    });
    const mailOptions = {
        from: 'ramarao.g92@gmail.com', // sender address
        to: req.body.email, // list of receivers
        subject: 'Welcome to Ezchat', // Subject line
        html: '<p>Your friend '+ req.body.user  +' Invited to ezchat</p>'// plain text body
    };
    transporter.sendMail(mailOptions, function (err, info) {
        if(!err){
            res.json({success: true, msg: info});
        } else {
            res.json({success: false, msg: err});
        }
    })
})
function send_msg(data){
    socket_server.send_data({to_user: data.to_user, user: data.user});
}
function send_user_status(data){
    socket_server.send_user_status(data);
}
module.exports = router;