const db = require("../models");
const redis = require('redis');
const e = require("express");

const User = db.user;
const HASHUSER = 'redis_irsan_betest';
//redis
let redisClient;

(async () => {
    redisClient = redis.createClient();

    redisClient.on("error", (error) => console.error(`Error : ${error}`));

    await redisClient.connect();
})();


exports.create = async (req, res) => {
    // Validate request
    if (!req.body.userName) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }

    // Create a User
    const user = new User({
        userName: req.body.userName,
        acountNumber: req.body.accountNumber,
        emailAddress: req.body.emailAddress,
        identityNumber: req.body.identityNumber
    });

    // Save User in the database
    user
        .save(user, async function (err, data) {
            if (err) {
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while creating the User."
                });
            } else {
                await redisClient.HSET(HASHUSER, data.id, JSON.stringify(data));
                res.send(data);
            }
        })
};

exports.findAll = async (req, res) => {

    const data = await redisClient.HGETALL(HASHUSER);
    let is_empty = Object.values(data).every(x => x === null || x === '');
    if (!is_empty) {
        let a = [];
        for (row in data) {
            a.push(JSON.parse(data[row]));
        }
        res.status(200).send(a);
    } else {
        User.find(async function (err, data) {
            if (err) {
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while retrieving User."
                });
            }
            else {
                for (row in data) {
                    await redisClient.HSET(HASHUSER, data[row].id, JSON.stringify(data[row]));
                }
                console.log('Users retrieved from MongoDB');
                res.send(data);
            }
        });
    }
};

exports.findOne = async (req, res) => {
    const id = req.params.id;

    const data = await redisClient.HGET(HASHUSER, id);
    if (data) {
        console.log('Users retrieved from Redis');
        res.status(200).send(JSON.parse(data));
    } else {
        console.log('Users retrieved from MongoDB');
        User.findById(id, async function (err, data) {
            if (err) {
                res.status(500).send({
                    message:
                        "Error retrieving User with id=" + id
                });
            } else {
                if (!data)
                    res.status(404).send({ message: "Not found User with id " + id });
                else {
                    await redisClient.HSET(HASHUSER, data.id, JSON.stringify(data));
                    res.send(data);
                }

            }
        })
    }

};

exports.update = (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update can not be empty!"
        });
    }

    const id = req.params.id;

    User.findByIdAndUpdate(id, req.body, { useFindAndModify: false, new : true},  async function (err, data) {
        if (err) {
            res.status(500).send({
                message:
                    "Error updating User with id=" + id
            });
        } else{
            if (!data) {
                res.status(404).send({
                    message: `Cannot update User with id=${id}. Maybe User was not found!`
                });
            } else {
                await redisClient.HSET(HASHUSER, data.id, JSON.stringify(data));
                res.send({ message: "User was updated successfully." });
            }
        }
    })
};

exports.delete = (req, res) => {
    const id = req.params.id;

    User.findByIdAndRemove(id, async function (err, data) {
        if (err) {
            res.status(500).send({
                message:
                    "Could not delete User with id=" + id
            });
        } else {
            if (!data) {
                res.status(404).send({
                    message: `Cannot delete User with id=${id}. Maybe User was not found!`
                });
            } else {
                await redisClient.HDEL(HASHUSER, id);
                res.send({
                    message: "User was deleted successfully!"
                });
            }
        }
    })
};