const localStrategy = require("passport-local").Strategy;
const mongoose = require('mongoose')
require('../models/user');

const User = require('../models/operator')

let OperatorSchema = mongoose.model('operator');

module.exports =  function(passport) {
    passport.use(new localStrategy((operatorName, password, done) => {
      OperatorSchema.find({ operatorName: operatorName }).exec(function (
        err,
        operators
      ) {
        if (err) {
            done(err)
        }
        if (operators.length === 0) {
            console.log("no such user")
          //res.status(400).json("unable to login, user does not exist");
          return done(null, false,{ message: '400' });
        } else {
          const operator = operators[0];
          if (password === operator.password) {
            //res.status(200).json("Login Successful!")
            return done(null,operator );
          } else {
            //res.status(403).json("Wrong password!")
            return done(null, false,{ message: '403' });
          }
        }
      })}));
    
      
passport.serializeUser((operator, cb) => {
   //if(operator!= false) {
    //console.log(operator)
    cb(null, operator.id);
  //}
});

  passport.deserializeUser((id, cb) => {
    OperatorSchema.findOne({ _id: id }, (err, operator) => {
      if(err){
        //console.log(err)
        cb(null, false, {error:err});
    }
      const userInformation = {
        operatorName: operator.operatorName,
      };
      cb(err, userInformation);
    });
  })

}
