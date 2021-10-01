const mongoose = require("mongoose");
const db = require("../models");
const Circle = db.circles;

const vault = require("../vaultRequest/vaultRequest")

const encryptMode = "encrypt"
const decryptMode = "decrypt"

// Create and Save a new circle
exports.create = async (req, res) => {
    // Validate request
    if (!req.body.name) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    // Create a circle
    const circle = new Circle({
        name: await vault.useVault(encryptMode,req.body.name),
        members: req.body.members,
        messages: [],
        owner: req.body.owner,
        settings: {
            msgDeletionTime: null,
            color: "#434343"
        },
        isDirect: req.body.isDirect
    });

    // Save circle in the database
    circle
        .save(circle)
        .then(data => {
            res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the circle."
            });
        });
};

// Retrieve all circles from the database.
exports.findAll = async (req, res) => {
    const name = req.query.name;
    var condition = name ? {
        name: {
            $regex: new RegExp(name),
            $options: "i"
        }
    } : {};

    Circle.find(condition)
        .then(async data => {
            var result = []
            Promise.all(data.map(async (element) =>{
                var tmpData = element._doc
                tmpData.name = await vault.useVault(decryptMode,tmpData.name)
                var messagesResult = [];
                await Promise.all(tmpData.messages.map(async (content) =>{
                    var tmpMessage = content;
                    tmpMessage.content = await vault.useVault(decryptMode,tmpMessage.content);
                    messagesResult.push(tmpMessage);
                }));
                tmpData.messages = messagesResult
                result.push(tmpData)
            })).then(()=>{
                res.send(result);
            });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving circles."
            });
        });
};

// Find a single circle with an id
exports.findOne = async (req, res) => {
    const id = req.params.id;

    Circle.findById(id)
        .then(async data => {
            if (!data){
                res.status(404).send({
                    message: "Not found circle with id " + id
                });
            }else{
                var result = data._doc
                result.name = await vault.useVault(decryptMode,result.name)
                var tmpMessages = [];
                Promise.all(result.messages.map(async (element) => {
                    var tmpMessage = element
                    tmpMessage.content = await vault.useVault(decryptMode,tmpMessage.content)
                    tmpMessages.push(tmpMessage);
                })).then(()=>{
                    res.send(result)
                });
            };
        })
        .catch(err => {
            res
                .status(500)
                .send({
                    message: "Error retrieving circle with id=" + id
                });
        });
};

// Update a circle by the id in the request
exports.update = (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update can not be empty!"
        });
    }

    const id = req.params.id;

    Circle.findByIdAndUpdate(id, req.body, {
            useFindAndModify: false
        })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot update circle with id=${id}. Maybe circle was not found!`
                });
            } else res.send({
                message: "circle was updated successfully."
            });
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating circle with id=" + id
            });
        });
};

// Delete a circle with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Circle.findByIdAndRemove(id)
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot delete circle with id=${id}. Maybe circle was not found!`
                });
            } else {
                res.send({
                    message: "circle was deleted successfully!"
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete circle with id=" + id
            });
        });
};

// Delete all circles from the database.
exports.deleteAll = (req, res) => {
    Circle.deleteMany({})
        .then(data => {
            res.send({
                message: `${data.deletedCount} circles were deleted successfully!`
            });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while removing all circles."
            });
        });
};

// Purge all published messages from a circle
exports.purge = (req, res) => {
    const id = req.params.id;

    Circle.findByIdAndUpdate(id, {
            messages: []
        }, {
            useFindAndModify: false
        })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot update circle with id=${id}. Maybe circle was not found!`
                });
            } else res.send({
                message: "circle was updated successfully."
            });
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating circle with id=" + id
            });
        });
};

// Add a message in a circle
exports.addMsg = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update can not be empty!"
        });
    }

    const id = req.params.id;

    var messages = [];

    Circle.findById(id)
        .then(data => {
            if (!data)
                res.status(404).send({
                    message: "Not found circle with id " + id
                });
            else messages=data.messages;
        })
        .catch(err => {
            res
                .status(500)
                .send({
                    message: "Error retrieving circle with id=" + id
                });
        }).then(async () => {
            console.log(messages);
            var msgToSend = req.body

            msgToSend.content = await vault.useVault(encryptMode,msgToSend.content);
            messages.push(msgToSend);
            messages = {
                "messages": messages
            }
            console.log(messages);
            Circle.findByIdAndUpdate(id, messages, {
                    useFindAndModify: false
                })
                .then(data => {
                    if (!data) {
                        res.status(404).send({
                            message: `Cannot update circle with id=${id}. Maybe circle was not found!`
                        });
                    } else {

                        res.send({
                            message: "circle was updated successfully."
                        });
                    }
                })
                .catch(err => {
                    res.status(500).send({
                        message: "Error updating circle with id=" + id
                    });
                });
        });
}
// Delete 1 message from a circle
exports.removeMsg = (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update can not be empty!"
        });
    }

    const id = req.params.id;
    const msg_id = req.params.msg_id;

    var messages = [];

    Circle.findById(id)
        .then(data => {
            if (!data)
                res.status(404).send({
                    message: "Not found circle with id " + id
                });
            else console.log("i");
        })
        .catch(err => {
            res
                .status(500)
                .send({
                    message: "Error retrieving circle with id=" + id
                });
        }).then(() => {
            messages.push(req.body);
            messages.forEach(element => {
                if(element._id === mongoose.Types.ObjectId(msg_id)){
                    messages = messages.filter(function(ele){ 
                        return ele != element; 
                    });
                }
            });
            messages = {
                "messages": messages
            }
            console.log(messages);
            Circle.findByIdAndUpdate(id, messages, {
                    useFindAndModify: false
                })
                .then(data => {
                    if (!data) {
                        res.status(404).send({
                            message: `Cannot update circle with id=${id}. Maybe circle was not found!`
                        });
                    } else {

                        res.send({
                            message: "circle was updated successfully."
                        });
                    }
                })
                .catch(err => {
                    res.status(500).send({
                        message: "Error updating circle with id=" + id
                    });
                });
        });
}