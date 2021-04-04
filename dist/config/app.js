"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const test_routes_1 = require("../routes/test_routes");
const common_routes_1 = require("../routes/common_routes");
const user_routes_1 = require("../routes/user_routes");
const company_routes_1 = require("../routes/company_routes");
const unit_routes_1 = require("../routes/unit_routes");
const asset_routes_1 = require("../routes/asset_routes");
require('dotenv/config');
class App {
    constructor() {
        this.mongoUrl = process.env.DB_URL;
        this.asset_routes = new asset_routes_1.AssetRoutes();
        this.unit_routes = new unit_routes_1.UnitRoutes();
        this.company_routes = new company_routes_1.CompanyRoutes();
        this.user_routes = new user_routes_1.UserRoutes();
        this.test_routes = new test_routes_1.TestRoutes();
        this.common_routes = new common_routes_1.CommonRoutes();
        this.app = express();
        this.config();
        this.mongoSetup();
        this.asset_routes.route(this.app);
        this.company_routes.route(this.app);
        this.unit_routes.route(this.app);
        this.user_routes.route(this.app);
        this.test_routes.route(this.app);
        this.common_routes.route(this.app); //always keep common_routes last
    }
    config() {
        // support application/json type post data
        this.app.use(bodyParser.json());
        //support application/x-www-form-urlencoded post data
        this.app.use(bodyParser.urlencoded({ extended: false }));
    }
    mongoSetup() {
        mongoose.connect(this.mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
    }
}
exports.default = new App().app;
