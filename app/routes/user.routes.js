module.exports = app => {
    const user = require("../controllers/user.controller.js");
    const auth = require("../middleware/auth");

    var router = require("express").Router();
  
    router.post("/", user.create);
    router.get("/", user.findAll);
    router.get("/:id", user.findOne);
    router.put("/:id", user.update);
    router.delete("/:id", user.delete);

    app.use('/api/user', auth, router);
  };