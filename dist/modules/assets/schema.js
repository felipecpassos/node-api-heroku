"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const model_1 = require("../common/model");
const Schema = mongoose.Schema;
const schema = new Schema({
    name: String,
    description: String,
    model: String,
    serial_number: String,
    unit: { type: Schema.Types.ObjectId, ref: 'Unit' },
    responsable: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        default: "Em operação"
    },
    health: {
        type: Number,
        default: 100,
        min: 0,
        max: 100
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    modification_notes: [model_1.ModificationNote]
});
exports.default = mongoose.model('assets', schema);
