"use strict";

const mongoose = require("mongoose");

const reqResLogsSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    requestFrom: {
        type: String,
        required: true
    },
    requestBody: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    responseSuccess: {
        type: Boolean,
        required: true
    },
    environment: {
        type: String,
        required: true
    },
    mailSent: {
        type: String,
        enum: ["success", "failed"],
        required: false
    }
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    },
});

module.exports = mongoose.model("reqResLogs", reqResLogsSchema);
