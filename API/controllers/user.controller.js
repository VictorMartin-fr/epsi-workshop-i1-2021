const db = require("../models");

const vault = require("../vaultRequest/vaultRequest")
const User = db.users;

const encryptMode = "encrypt"
const decryptMode = "decrypt"

// Create and Save a new user
exports.create = async (req, res) => {
    // Validate request
    if (!req.body.fname) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    // Create a user
    const user = new User({
        fname: await vault.useVault(encryptMode,req.body.fname),
        lname: await vault.useVault(encryptMode,req.body.lname),
        locked: req.body.locked,
        lastpassdate: await vault.useVault(encryptMode,req.body.lastpassdate),
        contacts: [],
        password: await vault.useVault(encryptMode,req.body.password)
    });

    // Save user in the database
    user
        .save(user)
        .then(data => {
            res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the user."
            });
        });
};

// Retrieve all users from the database.
exports.findAll = async (req, res) => {
    const fname = req.query.fname;
    var condition = fname ? {
        fname: {
            $regex: new RegExp(fname),
            $options: "i"
        }
    } : {};

    User.find(condition)
        .then(async data => {
            var result = [];
            Promise.all(data.map(async (element) =>{
                var tmpData = element._doc
                tmpData.fname = await vault.useVault(decryptMode,element.fname);
                tmpData.lname = await vault.useVault(decryptMode,element.lname);
                tmpData.lastpassdate = await vault.useVault(decryptMode,element.lastpassdate);
                tmpData.password = await vault.useVault(decryptMode,element.password);
                result.push(tmpData)
            })).then(()=>{
                res.send(result);
            });

            
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving users."
            });
        });
};

// Find a single user with an id
exports.findOne = async (req, res) => {
    const id = req.params.id;

    User.findById(id)
        .then(async data => {
            if (!data){
                res.status(404).send({
                    message: "Not found user with id " + id
                });
            }else{
                var result = data._doc
                result.fname = await vault.useVault(decryptMode,data.fname);
                result.lname = await vault.useVault(decryptMode,data.lname);
                result.lastpassdate = await vault.useVault(decryptMode,data.lastpassdate);
                result.password = await vault.useVault(decryptMode,data.password);
                res.send(result);
            } 
        })
        .catch(err => {
            res
                .status(500)
                .send({
                    message: "Error retrieving user with id=" + id
                });
        });
};

// Update a user by the id in the request
exports.update = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update can not be empty!"
        });
    }

    const id = req.params.id;

    var object = {};

    var fname = null;
    if(req.body.fname != undefined){
        fname = await vault.useVault(encryptMode,req.body.fname);
        object.fname = fname;
    }
    var lname = null;
    if(req.body.lname != undefined){
        lname = await vault.useVault(encryptMode,req.body.lname);
        object.lname = lname;
    }
    var locked = null;
    if(req.body.locked != undefined){
        locked = req.body.locked;
        object.locked = locked;
    }
    var lastpassdate = null;
    if(req.body.lastpassdate != undefined){
        lastpassdate = await vault.useVault(encryptMode,req.body.lastpassdate);
        object.lastpassdate = lastpassdate;
    }
    var contacts = null;
    if(req.body.contacts != undefined){
        contacts = req.body.contacts;
        object.contacts = contacts;
    }
    var password = null;
    if(req.body.password != undefined){
        password = await vault.useVault(encryptMode,req.body.password);
        object.password = password;
    }

    User.findByIdAndUpdate(id, object, {
            useFindAndModify: false
        })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot update user with id=${id}. Maybe user was not found!`
                });
            } else res.send({
                message: "user was updated successfully."
            });
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating user with id=" + id
            });
        });
};

// Delete a user with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    User.findByIdAndRemove(id)
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot delete user with id=${id}. Maybe user was not found!`
                });
            } else {
                res.send({
                    message: "user was deleted successfully!"
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete user with id=" + id
            });
        });
};

// Delete all users from the database.
exports.deleteAll = (req, res) => {
    User.deleteMany({})
        .then(data => {
            res.send({
                message: `${data.deletedCount} users were deleted successfully!`
            });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while removing all users."
            });
        });
};

// Find all locked users
exports.findAllLocked = (req, res) => {
    User.find({
            locked: true
        })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving users."
            });
        });
};