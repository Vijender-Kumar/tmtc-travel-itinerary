"use strict";

const Itinerary = require("../models/itinerary.model");
const { validateItineraryDates } = require("../utils/dateValidator");
const { verifyToken, rateLimiter } = require("../utils/helper");
var mongoose = require("mongoose");
const { redisClient } = require("../server");
const mails = require("../services/mail/genericMails.js");
const service = require("../services/mail.js");

module.exports = function (app) {

    // Create new itinerary
    app.post("/api/itineraries", rateLimiter, async function (req, res) {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(401).send({ message: "Token missing", success: false });

            const decoded = verifyToken(token);
            if (decoded.error) return res.status(400).send({ message: decoded.error, success: false });

            const data = {
                userId: decoded.data?.id,
                email: decoded.data?.email,
                title: req.body.title,
                destination: req.body.destination,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                activities: req.body.activities || []
            };

            const errors = validateItineraryDates(data);
            if (errors.length > 0) return res.status(400).send({ errors });

            const saved = await Itinerary.addOne(data);

            const subject = "TMTC Travel Itinerary created";
            const html = mails.genericMails("sendItinerary", {
                username: decoded.data?.email?.split("@")[0],
                title: saved.title,
                destination: saved.destination,
                startDate: saved.startDate,
                endDate: saved.endDate,
                activities: saved.activities
            });

            const mailResp = await service.sendMail(data.email, subject, html);

            if (!mailResp.messageId) {
                throw { success: false, message: "User added, but error while sending mail." };
            }

            return res.send({
                success: true,
                message: "Itinerary created",
                data: {
                    title: saved.title,
                    destination: saved.destination,
                    dataId: saved._id
                }
            });

        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).send({
                    message: "Same title & destination already exists for this user",
                    success: false
                });
            }
            return res.status(500).send({ message: "Server error", error, success: false });
        }
    });


    // Get all itineraries (with filters + pagination)
    app.get("/api/itineraries", rateLimiter, async function (req, res) {
        try {
            const filter = {};
            if (req.query.destination) {
                filter.destination = { $regex: req.query.destination, $options: "i" };
            }

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const sort = req.query.sort || "createdAt";

            const data = await Itinerary.getAll(filter, skip, limit, sort);
            const total = await Itinerary.getCount(filter);

            return res.send({ success: true, data, total, page, limit });

        } catch (err) {
            return res.status(500).send(err);
        }
    });

    // Get itinerary by ID
    app.get("/api/itineraries/:id", rateLimiter, async function (req, res) {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(401).send({ message: "Token missing", success: false });

            const decoded = verifyToken(token);
            if (decoded.error) return res.status(400).send({ message: decoded.error });

            const itineraryId = req.params.id;
            if (!mongoose.Types.ObjectId.isValid(itineraryId)) {
                return res.status(400).send({ message: "Invalid itinerary ID", success: false });
            }

            // Check Redis cache first
            if (redisClient && redisClient.status === "ready") {
                try {
                    const cacheKey = `itinerary:${itineraryId}`;
                    const cached = await redisClient.get(cacheKey);

                    if (cached) {
                        return res.send({ success: true, data: JSON.parse(cached) });
                    }
                } catch (e) {
                    console.log("Redis fetch error:", e.message);
                }
            }

            const itinerary = await Itinerary.findById(new mongoose.Types.ObjectId(itineraryId));
            if (!itinerary) return res.status(404).send({ message: "Itinerary not found", success: false });

            if (itinerary.userId.toString() !== decoded.data?.id) {
                return res.status(403).send({ message: "Forbidden: Not your itinerary", success: false });
            }
            // remove fields before sending
            const { _id, title, destination, startDate, endDate, activities } = itinerary.toObject();
            const responseData = { _id, title, destination, startDate, endDate, activities };

            // Set cache for 5 minutes (300 seconds)
            if (redisClient && redisClient.status === "ready") {
                try {
                    await redisClient.setEx(cacheKey, 300, JSON.stringify(responseData));
                } catch (e) {
                    console.log("Redis save error:", e.message);
                }
            }

            return res.send({
                success: true,
                data: responseData
            });
        } catch (err) {
            return res.status(500).send(err);
        }
    });

    // Update itinerary
    app.put("/api/itineraries/:id", rateLimiter, async function (req, res) {
        try {
            const token = req.headers.authorization;
            if (!token)
                return res.status(401).send({ message: "Token missing", success: false });

            const decoded = verifyToken(token);

            const itineraryId = req.params.id;

            if (!mongoose.Types.ObjectId.isValid(itineraryId)) {
                return res.status(400).send({ message: "Invalid itinerary ID", success: false });
            }

            const itinerary = await Itinerary.findById(itineraryId);
            if (!itinerary)
                return res.status(404).send({ message: "Not found", success: false });

            if (itinerary.userId.toString() !== decoded.data?.id) {
                return res.status(403).send({ message: "Not allowed", success: false });
            }

            const errors = validateItineraryDates(req.body);
            if (errors.length > 0)
                return res.status(400).send({ errors, success: false });

            const exists = await Itinerary.findOne({
                userId: decoded.data?.id,
                title: req.body.title,
                destination: req.body.destination,
                _id: { $ne: itineraryId }
            });

            if (exists) {
                return res.status(409).send({
                    message: "Itinerary already exists",
                    success: false,
                });
            }

            const updated = await Itinerary.updateOne(itineraryId, req.body);

            // Clear Redis cache after update
            const cacheKey = `itinerary:${itineraryId}`;
            await redisClient.del(cacheKey);

            // remove fields before sending
            const { _id, title, destination, startDate, endDate, activities } = updated.toObject();
            return res.send({
                success: true, message: "Updated", data: {
                    _id,
                    title,
                    destination,
                    startDate,
                    endDate,
                    activities
                }
            });

        } catch (err) {
            return res.status(400).send({
                message: err.message,
                success: false
            });
        }
    });

    // Delete itinerary
    app.delete("/api/itineraries/:id", rateLimiter, async function (req, res) {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(401).send({ message: "Token missing", success: false });

            const decoded = verifyToken(token);

            const itineraryId = req.params.id;
            if (!mongoose.Types.ObjectId.isValid(itineraryId)) {
                return res.status(400).send({ message: "Invalid itinerary ID", success: false });
            }

            const itinerary = await Itinerary.findById(itineraryId);
            if (!itinerary) return res.status(404).send({ message: "Not found", success: false });

            if (itinerary.userId.toString() !== decoded.data?.id)
                return res.status(403).send({ message: "Not allowed", success: false });

            await Itinerary.deleteOne(itineraryId);

            // Clear Redis cache after delete
            const cacheKey = `itinerary:${itineraryId}`;
            await redisClient.del(cacheKey);

            return res.send({ success: true, message: "Deleted successfully" });

        } catch (err) {
            return res.status(400).send(err);
        }
    });

    // Generate shareable link
    app.post("/api/itineraries/:id/share", rateLimiter, async function (req, res) {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(401).send({ success: false, message: "Token missing" });

            const decoded = verifyToken(token);
            if (decoded.error)
                return res.status(400).send({ success: false, message: decoded.error });

            const itinerary = await Itinerary.findById(req.params.id);
            if (!itinerary)
                return res.status(404).send({ success: false, message: "Itinerary not found" });

            if (itinerary.userId.toString() !== decoded.data?.id)
                return res.status(403).send({ success: false, message: "Not allowed" });

            const shared = await Itinerary.generateShareId(req.params.id);

            return res.send({
                success: true,
                message: "Shareable link generated",
                shareableUrl: `${req.protocol}://${req.get("host")}/api/itineraries/share/${shared.shareableId}`
            });

        } catch (error) {
            if (error.name === "CastError") {
                return res.status(404).send({ success: false, message: "Itinerary Id not found" });
            }
            return res.status(500).send({ success: false, message: "Server error", error });
        }
    });

    // Public itinerary access using share link (no login)
    app.get("/api/itineraries/share/:shareableId", rateLimiter, async function (req, res) {
        try {
            const shareableId = req.params.shareableId;

            const itinerary = await Itinerary.findByShareId(shareableId);

            if (!itinerary)
                return res.status(404).send({ success: false, message: "Invalid or expired link" });

            return res.send({
                success: true,
                data: {
                    title: itinerary.title,
                    destination: itinerary.destination,
                    startDate: itinerary.startDate,
                    endDate: itinerary.endDate,
                    activities: itinerary.activities,
                    createdAt: itinerary.createdAt
                }
            });

        } catch (error) {
            return res.status(500).send({ success: false, message: "Server error", error });
        }
    });

};