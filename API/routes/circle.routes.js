module.exports = app => {
    const circles = require("../controllers/circle.controller.js");

    var router = require("express").Router();

    // Create a new circle
    router.post("/", circles.create);

    // Retrieve all circles
    router.get("/", circles.findAll);

    // Retrieve a single circle with id
    router.get("/:id", circles.findOne);

    // Update a circle with id
    router.put("/:id", circles.update);

    // Delete a circle with id
    router.delete("/:id", circles.delete);

    // Delete all circles
    router.delete("/", circles.deleteAll);

    // Post a msg
    router.post("/:id/messages", circles.addMsg);

    // Delete all messages from a circle
    router.delete("/:id/purge",circles.purge);

    // Delete 1 message from a circle
    router.delete("/:id/messages/:msg_id",circles.removeMsg);

    app.use('/api/circles', router);
};