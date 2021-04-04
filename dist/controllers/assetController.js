"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetController = void 0;
const service_1 = require("../modules/common/service");
const service_2 = require("../modules/assets/service");
const service_3 = require("../modules/units/service");
const service_4 = require("../modules/users/service");
class AssetController {
    constructor() {
        this.asset_service = new service_2.default();
        this.unit_service = new service_3.default();
        this.user_service = new service_4.default();
    }
    create_asset(req, res) {
        // this check whether all the filds were send through the erquest or not
        if (req.body.name &&
            req.body.description &&
            req.body.model &&
            req.body.serial_number &&
            req.body.unit &&
            req.body.responsable) {
            const asset_params = {
                name: req.body.name,
                description: req.body.description,
                model: req.body.model,
                serial_number: req.body.serial_number,
                unit: req.body.unit,
                responsable: req.body.responsable,
                modification_notes: [{
                        modified_on: new Date(Date.now()),
                        modified_by: null,
                        modification_note: 'New asset created'
                    }]
            };
            //CHECK IF RESPONSABLE EXISTS
            const user_filter = { _id: req.body.responsable };
            this.user_service.filterUser(user_filter, (err, user_data) => {
                if (err) {
                    service_1.mongoError(err, res);
                }
                else {
                    if (user_data === null) {
                        service_1.failureResponse("User does not exist", null, res);
                    }
                    else {
                        //CHECK IF UNIT EXISTS
                        const unit_filter = { _id: req.body.unit };
                        this.unit_service.filterUnit(unit_filter, (err, unit_data) => {
                            if (err) {
                                service_1.mongoError(err, res);
                            }
                            else {
                                if (unit_data === null) {
                                    service_1.failureResponse("Unit does not exist", null, res);
                                }
                                else {
                                    //UNIT AND RESPOSABLE EXISTS, NOW THE TASK ITSELF
                                    this.asset_service.createAsset(asset_params, (err, asset_data) => {
                                        if (err) {
                                            service_1.mongoError(err, res);
                                        }
                                        else {
                                            //ADD ASSET ID TO UNIT DOCUMENT
                                            this.unit_service.filterUnit({ _id: asset_data.unit }, (err, unit_data) => {
                                                if (err) {
                                                    service_1.mongoError(err, res);
                                                }
                                                else {
                                                    // successResponse('get unit successfull', unit_data, res);
                                                    if (unit_data === null)
                                                        service_1.mongoError(err, res);
                                                    var mongoose = require('mongoose');
                                                    var assetObjectId = mongoose.Types.ObjectId(asset_data._id);
                                                    unit_data.assets.push(assetObjectId);
                                                    this.unit_service.updateUnit(unit_data, (err) => {
                                                        if (err) {
                                                            service_1.mongoError(err, res);
                                                        }
                                                        else {
                                                            //ADDED ASSET ON UNIT DOCUMENT
                                                            // successResponse('create asset successfull', asset_data, res);
                                                            //TODO ADD ASSET ON USER DOCUMENT
                                                            this.user_service.filterUser({ _id: req.body.responsable }, (err, user_data) => {
                                                                if (err) {
                                                                    service_1.mongoError(err, res);
                                                                }
                                                                else {
                                                                    // console.log("get user : "+user_data);
                                                                    // successResponse('get user successfull', user_data, res);
                                                                    var assetObjectId2 = mongoose.Types.ObjectId(asset_data._id);
                                                                    user_data.assets_responsable.push(assetObjectId2);
                                                                    this.user_service.updateUser(user_data, (err) => {
                                                                        if (err) {
                                                                            service_1.mongoError(err, res);
                                                                        }
                                                                        else {
                                                                            //ADDED ASSET ON UNIT DOCUMENT
                                                                            // successResponse('update user successfull', null, res);
                                                                            service_1.successResponse('create asset successfull', asset_data, res);
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            });
        }
        else {
            // error response if some fields are missing in request body
            service_1.insufficientParameters(res);
        }
    }
    get_asset(req, res) {
        if (req.params.id) {
            const asset_filter = { _id: req.params.id };
            this.asset_service.filterAsset(asset_filter, (err, asset_data) => {
                if (err) {
                    service_1.mongoError(err, res);
                }
                else {
                    service_1.successResponse('get asset successfull', asset_data, res);
                }
            });
        }
        else {
            service_1.insufficientParameters(res);
        }
    }
    // public get_all_assets_from_user(req: Request, res: Response) {
    //         this.asset_service.getAllAssetsFromUnit(req.params.unit_id, (err: any, asset_data: [IAsset]) => {
    //             if (err) {
    //                 mongoError(err, res);
    //             } else {
    //                 successResponse('get asset successfull', asset_data, res);
    //             }
    //         });
    // }
    update_asset(req, res) {
        if (req.params.id &&
            req.body.name ||
            req.body.description ||
            req.body.model ||
            req.body.serial_number ||
            req.body.unit ||
            req.body.responsable ||
            req.body.health) {
            const asset_filter = { _id: req.params.id };
            this.asset_service.filterAsset(asset_filter, (err, asset_data) => {
                if (err) {
                    service_1.mongoError(err, res);
                }
                else if (asset_data) {
                    asset_data.modification_notes.push({
                        modified_on: new Date(Date.now()),
                        modified_by: null,
                        modification_note: 'Asset data updated'
                    });
                    //setting status
                    if (req.body.health <= 50) {
                        asset_data.status = 'Em Alerta';
                    }
                    else if (req.body.health <= 1) {
                        asset_data.status = 'Em parada';
                    }
                    else {
                        asset_data.status = 'Em operação';
                    }
                    const asset_params = {
                        _id: req.params.id,
                        name: req.body.name ? req.body.name : asset_data.name,
                        description: req.body.description ? req.body.description : asset_data.description,
                        model: req.body.model ? req.body.model : asset_data.model,
                        serial_number: req.body.serial_number ? req.body.serial_number : asset_data.serial_number,
                        unit: req.body.unit ? req.body.unit : asset_data.unit,
                        responsable: req.body.responsable ? req.body.responsable : asset_data.responsable,
                        health: req.body.health ? req.body.health : asset_data.health,
                        status: asset_data.status,
                        modification_notes: asset_data.modification_notes
                    };
                    this.asset_service.updateAsset(asset_params, (err) => {
                        if (err) {
                            service_1.mongoError(err, res);
                        }
                        else {
                            service_1.successResponse('update asset successfull', null, res);
                        }
                    });
                }
                else {
                    service_1.failureResponse('invalid asset', null, res);
                }
            });
        }
        else {
            service_1.insufficientParameters(res);
        }
    }
    delete_asset(req, res) {
        if (req.params.id) {
            this.asset_service.filterAsset({ _id: req.params.id }, (err, asset_data) => {
                if (err) {
                    service_1.mongoError(err, res);
                }
                else {
                    if (asset_data === null) {
                        service_1.failureResponse('invalid asset', null, res);
                    }
                    else {
                        // GOT THE ASSET, NOW REMOVE ASSET FROM ASSETS ARRAY ON UNIT OBJECT
                        this.unit_service.filterUnit({ _id: asset_data.unit }, (err, unit_data) => {
                            if (err) {
                                service_1.mongoError(err, res);
                            }
                            else {
                                // successResponse('get unit successfull', unit_data, res);
                                for (let i = 0; i < unit_data.assets.length; i++) {
                                    const asset = unit_data.assets[i];
                                    if (asset.toString() === req.params.id) {
                                        unit_data.assets.splice(i--, 1);
                                    }
                                }
                                console.log("Deleted asset from unit asset array: " + [unit_data.assets]);
                                this.unit_service.updateUnit(unit_data, (err) => {
                                    if (err) {
                                        console.log("aqui?");
                                        service_1.mongoError(err, res);
                                    }
                                    else {
                                        // successResponse('update unit successfull', null, res);
                                        // NOW REMOVE ASSET FROM ASSETS ARRAY ON USER OBJECT
                                        this.user_service.filterUser({ _id: asset_data.responsable }, (err, user_data) => {
                                            if (err) {
                                                console.log("aqui 2?");
                                                service_1.mongoError(err, res);
                                            }
                                            else {
                                                // successResponse('get user successfull', user_data, res);
                                                for (let i = 0; i < user_data.assets_responsable.length; i++) {
                                                    const asset = user_data.assets_responsable[i];
                                                    if (asset.toString() === req.params.id) {
                                                        user_data.assets_responsable.splice(i--, 1);
                                                    }
                                                }
                                                this.user_service.updateUser(user_data, (err) => {
                                                    if (err) {
                                                        console.log("aqui 3?");
                                                        service_1.mongoError(err, res);
                                                    }
                                                    else {
                                                        // successResponse('update user successfull', null, res);
                                                        // Get the asset in order to delete the asset image
                                                        this.asset_service.filterAsset({ _id: req.params.id }, (err, asset_data) => {
                                                            if (err) {
                                                                console.log("aqui 4?");
                                                                service_1.mongoError(err, res);
                                                            }
                                                            else {
                                                                // successResponse('ge asset successfull', asset_data, res);
                                                                // Finally, delete the asset itself
                                                                this.asset_service.deleteAsset(req.params.id, (err, delete_details) => {
                                                                    if (err) {
                                                                        console.log("aqui 5?");
                                                                        service_1.mongoError(err, res);
                                                                    }
                                                                    else if (delete_details.deletedCount !== 0) {
                                                                        //DELETING FROM THE FILE SYSTEM
                                                                        const fs = require('fs');
                                                                        const path = 'images/assets/' + asset_data.serial_number + '.jpg';
                                                                        try {
                                                                            fs.unlinkSync(path);
                                                                            //file removed
                                                                        }
                                                                        catch (err) {
                                                                            console.error(err);
                                                                        }
                                                                        if (!err)
                                                                            service_1.successResponse('delete asset successfull', null, res);
                                                                        else
                                                                            service_1.failureResponse('asset removed from db, but image file failed to be deleted', null, res);
                                                                    }
                                                                    else {
                                                                        service_1.failureResponse('invalid asset', null, res);
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }
        else {
            service_1.insufficientParameters(res);
        }
    }
}
exports.AssetController = AssetController;
