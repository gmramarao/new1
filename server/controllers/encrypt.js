'use strict';
const bcrypt = require('bcrypt-node'),
      async = require('async');

function encrypt_pwd(pwd, callback1){
    async.waterfall([
        function(callback){
            // bcrypt.genSalt(10, callback);
            callback(null, 'salt');
        },
        function(salt, callback){
            bcrypt.hash(pwd, null, null, callback)
        }
    ], (err, hash)=>{
        console.log(err);
        if(!err){
            callback1(null, hash);
        } else {
            callback1(err, null);
        }
    })
  
//   callback1(null, pwd);
    
}

module.exports = {
    encrypt_pwd: encrypt_pwd 
}
