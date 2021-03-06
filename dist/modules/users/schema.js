"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const model_1 = require("../common/model");
const Schema = mongoose.Schema;
const schema = new Schema({
    name: {
        type: {
            first_name: String,
            last_name: String
        }
    },
    email: String,
    phone_number: String,
    gender: String,
    companies: [{ type: Schema.Types.ObjectId, ref: 'Company' }],
    employee_on: [{ type: Schema.Types.ObjectId, ref: 'Company' }],
    assets_responsable: [{ type: Schema.Types.ObjectId, ref: 'Assets' }],
    is_deleted: {
        type: Boolean,
        default: false
    },
    modification_notes: [model_1.ModificationNote]
});
exports.default = mongoose.model('users', schema);
