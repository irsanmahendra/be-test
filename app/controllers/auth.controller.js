const e = require("express");
const jwt = require('jsonwebtoken');
const db = require("../models");
const redis = require('redis');
const User = db.user;
require('dotenv').config();

exports.generateToken = async (req, res) => {
    if (!req.body.id) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }

    var id = req.body.id;
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
                var token = jwt.sign({id : id, userName: data.userName}, process.env.TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRE });
                var response = {
                    'user' : data,
                    'access_token' : token
                }
                res.send(response);
            }

        }
    })

   
};