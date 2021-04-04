"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = require("./schema");
class AssetService {
    createAsset(asset_params, callback) {
        const _session = new schema_1.default(asset_params);
        _session.save(callback);
    }
    filterAsset(query, callback) {
        schema_1.default.findOne(query, callback);
    }
    updateAsset(asset_params, callback) {
        const query = { _id: asset_params._id };
        schema_1.default.findOneAndUpdate(query, asset_params, callback);
    }
    deleteAsset(_id, callback) {
        const query = { _id: _id };
        schema_1.default.deleteOne(query, callback);
    }
}
exports.default = AssetService;
