module.exports = app => {
    const auth = require("../controllers/auth.controller.js");
  
    var router = require("express").Router();
  
    router.post("/", auth.generateToken);

    app.use('/api/auth', router);
  };