"use strict";

const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const { generateToken, rateLimiter } = require("../utils/helper.js");
const mails = require("../services/mail/genericMails.js");
const service = require("../services/mail.js");

module.exports = function (app) {

    app.post("/api/auth/register", rateLimiter, async function (req, res) {
        try {
            const userData = {
                username: req.body.name,
                email: req.body.email,
                userpass: req.body.password
            };

            if (!userData.username || !userData.email || !userData.userpass)
                throw { success: false, message: "Please provide name, email, and password" };

            // Keep plain password for email
            // const plainPassword = userData.userpass;

            const userRes = await User.addOne(userData);
            if (!userRes)
                throw { message: "Error while adding user data to database" };

            // for Sending the Mail to the USER after Registeration
            // const subject = "TMTC Travel Itinerary user registered.";
            // const htmlcontent = mails.genericMails("registerUser", {
            //     username: userData.username,
            //     email: userData.email,
            //     userpass: plainPassword
            // });

            // const mailResp = await service.sendMail(userData.email, subject, htmlcontent);

            // if (!mailResp.messageId) {
            //     throw { success: false, message: "User added, but error while sending mail." };
            // }
            // console.log("Mail is sent successfully for the user:", userData.email)

            return res.send({ message: "User registered successfully.", userName: userRes.username, email: userRes.email, success: true });
        } catch (error) {
            console.log(error);
            if(error.code === 11000) {
                return res.status(400).send({ message: "EMAIL Id already present", success: false });
            }

            return res.status(400).send({ error, success: false });
        }
    });

    app.post("/api/auth/login", rateLimiter, async function (req, res) {
        try {
            const { email, password } = req.body;

            // Find user including hashed password
            const user = await User.findByEmail(email);
            if (!user) return res.status(401).json({ message: "Invalid email or password" });

            const match = await bcrypt.compare(password, user.userpass);
            if (!match) return res.status(401).json({ message: "Invalid email or password" });

            // Generate JWT token (make sure generateToken function exists)
            const token = generateToken({ id: user._id.toString(), email: user.email });

            res.status(200).json({ message: "Login successful", token, success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message, success: false });
        }
    });


};
