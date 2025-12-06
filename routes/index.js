"use strict";

function includeAllRoutes(app, passport) {
    // These are Auth routes
    require('../controllers/auth.controller')(app, passport);

    // These are Itinerary Routes
    require('../controllers/itinerary.controller')(app, passport);

}

module.exports = function (app, passport) {
    includeAllRoutes(app, passport);
};
