"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitController = void 0;
const service_1 = require("../modules/common/service");
const service_2 = require("../modules/units/service");
const service_3 = require("../modules/companies/service");
class UnitController {
    constructor() {
        this.unit_service = new service_2.default();
        this.company_service = new service_3.default();
    }
    create_unit(req, res) {
        // this check whether all the filds were send through the erquest or not
        if (req.body.unit_name &&
            req.body.owner_company &&
            req.body.contact_email &&
            req.body.phone_number) {
            const unit_params = {
                unit_name: req.body.unit_name,
                owner_company: req.body.owner_company,
                contact_email: req.body.contact_email,
                phone_number: req.body.phone_number,
                modification_notes: [{
                        modified_on: new Date(Date.now()),
                        modified_by: null,
                        modification_note: 'New unit created'
                    }]
            };
            this.unit_service.createUnit(unit_params, (err, unit_data) => {
                if (err) {
                    service_1.mongoError(err, res);
                }
                else {
                    //TODO ADD UNIT ID TO COMPANY DOCUMENT
                    this.company_service.filterCompany({ _id: req.body.owner_company }, (err, company_data) => {
                        if (err) {
                            service_1.mongoError(err, res);
                        }
                        else {
                            // successResponse('get company successfull', company_data, res);
                            console.log("get company : " + company_data);
                            var mongoose = require('mongoose');
                            var unitObjectId = mongoose.Types.ObjectId(unit_data._id);
                            company_data.business_units.push(unitObjectId);
                            this.company_service.updateCompany(company_data, (err) => {
                                if (err) {
                                    service_1.mongoError(err, res);
                                }
                                else {
                                    // successResponse('update company successfull', null, res);
                                    service_1.successResponse('create unit successfull', unit_data, res);
                                }
                            });
                        }
                    });
                }
            });
        }
        else {
            // error response if some fields are missing in request body
            service_1.insufficientParameters(res);
        }
    }
    get_unit(req, res) {
        if (req.params.id) {
            const unit_filter = { _id: req.params.id };
            this.unit_service.filterUnit(unit_filter, (err, unit_data) => {
                if (err) {
                    service_1.mongoError(err, res);
                }
                else {
                    console.log("get unit : " + unit_data);
                    service_1.successResponse('get unit successfull', unit_data, res);
                }
            });
        }
        else {
            service_1.insufficientParameters(res);
        }
    }
    // public get_all_units_from_user(req: Request, res: Response) {
    //         this.unit_service.getAllUnitsFromCompany(req.params.company_id, (err: any, unit_data: [IUnit]) => {
    //             if (err) {
    //                 mongoError(err, res);
    //             } else {
    //                 successResponse('get unit successfull', unit_data, res);
    //             }
    //         });
    // }
    update_unit(req, res) {
        if (req.params.id &&
            req.body.unit_name ||
            req.body.owner_company ||
            req.body.contact_email ||
            req.body.phone_number) {
            const unit_filter = { _id: req.params.id };
            this.unit_service.filterUnit(unit_filter, (err, unit_data) => {
                if (err) {
                    service_1.mongoError(err, res);
                }
                else if (unit_data) {
                    unit_data.modification_notes.push({
                        modified_on: new Date(Date.now()),
                        modified_by: null,
                        modification_note: 'Unit data updated'
                    });
                    const unit_params = {
                        _id: req.params.id,
                        unit_name: req.body.unit_name ? req.body.unit_name : unit_data.unit_name,
                        owner_company: req.body.owner_company ? req.body.owner_company : unit_data.owner_company,
                        contact_email: req.body.contact_email ? req.body.contact_email : unit_data.contact_email,
                        phone_number: req.body.phone_number ? req.body.phone_number : unit_data.phone_number,
                        is_deleted: req.body.is_deleted ? req.body.is_deleted : unit_data.is_deleted,
                        modification_notes: unit_data.modification_notes
                    };
                    this.unit_service.updateUnit(unit_params, (err) => {
                        if (err) {
                            service_1.mongoError(err, res);
                        }
                        else {
                            service_1.successResponse('update unit successfull', null, res);
                        }
                    });
                }
                else {
                    service_1.failureResponse('invalid unit', null, res);
                }
            });
        }
        else {
            service_1.insufficientParameters(res);
        }
    }
    delete_unit(req, res) {
        if (req.params.id) {
            this.unit_service.filterUnit({ _id: req.params.id }, (err, unit_data) => {
                if (err) {
                    service_1.mongoError(err, res);
                }
                else {
                    console.log("get unit : " + unit_data);
                    this.company_service.filterCompany({ _id: unit_data.owner_company }, (err, company_data) => {
                        if (err) {
                            service_1.mongoError(err, res);
                        }
                        else {
                            // successResponse('get company successfull', company_data, res);
                            console.log("get company : " + [company_data.business_units]);
                            //REMOVE COMPANY FROM COMPANIES ARRAY ON USER OBJECT
                            for (let i = 0; i < company_data.business_units.length; i++) {
                                const unit = company_data.business_units[i];
                                if (unit.toString() === req.params.id) {
                                    company_data.business_units.splice(i--, 1);
                                }
                            }
                            console.log("Deleted unit from company unit array: " + [company_data.business_units]);
                            this.company_service.updateCompany(company_data, (err) => {
                                if (err) {
                                    service_1.mongoError(err, res);
                                }
                                else {
                                    // successResponse('update company successfull', null, res);
                                    //Finally, delete the company itself
                                    this.unit_service.deleteUnit(req.params.id, (err, delete_details) => {
                                        if (err) {
                                            service_1.mongoError(err, res);
                                        }
                                        else if (delete_details.deletedCount !== 0) {
                                            service_1.successResponse('delete unit successfull', null, res);
                                        }
                                        else {
                                            service_1.failureResponse('invalid unit', null, res);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
        else {
            service_1.insufficientParameters(res);
        }
    }
}
exports.UnitController = UnitController;
