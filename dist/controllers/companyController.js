"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyController = void 0;
const service_1 = require("../modules/common/service");
const service_2 = require("../modules/companies/service");
const service_3 = require("../modules/users/service");
class CompanyController {
    constructor() {
        this.company_service = new service_2.default();
        this.user_service = new service_3.default();
    }
    create_company(req, res) {
        // this check whether all the filds were send through the erquest or not
        if (req.body.name &&
            req.body.owner &&
            req.body.company_email &&
            req.body.phone_number) {
            const company_params = {
                name: req.body.name,
                owner: req.body.owner,
                company_email: req.body.company_email,
                phone_number: req.body.phone_number,
                modification_notes: [{
                        modified_on: new Date(Date.now()),
                        modified_by: req.body.owner,
                        modification_note: 'New company created'
                    }]
            };
            this.company_service.createCompany(company_params, (err, company_data) => {
                if (err) {
                    console.log("teste 0");
                    service_1.mongoError(err, res);
                }
                else {
                    //ADDING COMPANY TO OWNER USER
                    var mongoose = require('mongoose');
                    const user_filter = { _id: req.body.owner };
                    this.user_service.filterUser(user_filter, (err, user_data) => {
                        if (err) {
                            service_1.mongoError(err, res);
                        }
                        else {
                            var userObjectId = mongoose.Types.ObjectId(company_data._id);
                            user_data.companies.push(userObjectId);
                            this.user_service.updateUser(user_data, (err) => {
                                if (err) {
                                    service_1.mongoError(err, res);
                                }
                                else {
                                    service_1.successResponse('create company successfull', company_data, res);
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
    get_company(req, res) {
        if (req.params.id) {
            const company_filter = { _id: req.params.id };
            this.company_service.filterCompany(company_filter, (err, company_data) => {
                if (err) {
                    service_1.mongoError(err, res);
                }
                else {
                    service_1.successResponse('get company successfull', company_data, res);
                }
            });
        }
        else {
            service_1.insufficientParameters(res);
        }
    }
    update_company(req, res) {
        if (req.params.id &&
            req.body.name ||
            req.body.owner ||
            req.body.company_email ||
            req.body.phone_number) {
            const company_filter = { _id: req.params.id };
            this.company_service.filterCompany(company_filter, (err, company_data) => {
                if (err) {
                    service_1.mongoError(err, res);
                }
                else if (company_data) {
                    company_data.modification_notes.push({
                        modified_on: new Date(Date.now()),
                        modified_by: null,
                        modification_note: 'Company data updated'
                    });
                    const company_params = {
                        _id: req.params.id,
                        name: req.body.name ? req.body.name : company_data.name,
                        owner: req.body.owner ? req.body.owner : company_data.owner,
                        company_email: req.body.company_email ? req.body.company_email : company_data.company_email,
                        phone_number: req.body.phone_number ? req.body.phone_number : company_data.phone_number,
                        is_deleted: req.body.is_deleted ? req.body.is_deleted : company_data.is_deleted,
                        modification_notes: company_data.modification_notes
                    };
                    this.company_service.updateCompany(company_params, (err) => {
                        if (err) {
                            service_1.mongoError(err, res);
                        }
                        else {
                            service_1.successResponse('update company successfull', null, res);
                        }
                    });
                }
                else {
                    service_1.failureResponse('invalid company', null, res);
                }
            });
        }
        else {
            service_1.insufficientParameters(res);
        }
    }
    // 1 - Create request to add employee to company (Many-to-Many: User.employee_on <=> Company.personel)
    add_personel(req, res) {
        if (req.body.user_id) {
            const company_filter = { _id: req.params.id };
            // 1.1 - First add employee to the "personel" array of the company
            this.company_service.filterCompany(company_filter, (err, company_data) => {
                if (err) {
                    service_1.mongoError(err, res);
                }
                else {
                    // successResponse('get company successfull', company_data, res);
                    console.log("get company : " + company_data);
                    var mongoose = require('mongoose');
                    var userObjectId = mongoose.Types.ObjectId(req.body.user_id);
                    company_data.personel.push(userObjectId);
                    this.company_service.updateCompany(company_data, (err) => {
                        if (err) {
                            service_1.mongoError(err, res);
                        }
                        else {
                            //1.1 Succeeded
                            // 1.2 - Then add the company on "employee_on" on the employee user array
                            this.user_service.filterUser({ _id: req.body.user_id }, (err, user_data) => {
                                if (err) {
                                    service_1.mongoError(err, res);
                                }
                                else {
                                    console.log("get user : " + user_data);
                                    // successResponse('get user successfull', user_data, res);
                                    var mongoose = require('mongoose');
                                    var companyObjectId = mongoose.Types.ObjectId(req.params.id);
                                    user_data.employee_on.push(companyObjectId);
                                    this.user_service.updateUser(user_data, (err) => {
                                        if (err) {
                                            service_1.mongoError(err, res);
                                        }
                                        else {
                                            // 1.2 Succeeded
                                            service_1.successResponse('add personel successful', null, res);
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
            // error response if some fields are missing in request body
            service_1.insufficientParameters(res);
        }
    }
    delete_company(req, res) {
        if (req.params.id) {
            //TODO DELETE COMPANY FROM USER FIRST
            this.company_service.filterCompany({ _id: req.params.id }, (err, company_data) => {
                if (err) {
                    service_1.mongoError(err, res);
                }
                else {
                    console.log("get company : " + company_data);
                    this.user_service.filterUser({ _id: company_data.owner }, (err, user_data) => {
                        if (err) {
                            service_1.mongoError(err, res);
                        }
                        else {
                            // successResponse('get user successfull', user_data, res);
                            console.log("get user : " + [user_data.companies]);
                            //REMOVE COMPANY FROM COMPANIES ARRAY ON USER OBJECT
                            for (let i = 0; i < user_data.companies.length; i++) {
                                const company = user_data.companies[i];
                                if (company.toString() === req.params.id) {
                                    user_data.companies.splice(i--, 1);
                                }
                            }
                            console.log("Deleted company from user company array: " + [user_data.companies]);
                            this.user_service.updateUser(user_data, (err) => {
                                if (err) {
                                    service_1.mongoError(err, res);
                                }
                                else {
                                    // successResponse('update user successfull', null, res);
                                    //Finally, delete the company itself
                                    this.company_service.deleteCompany(req.params.id, (err, delete_details) => {
                                        if (err) {
                                            service_1.mongoError(err, res);
                                        }
                                        else if (delete_details.deletedCount !== 0) {
                                            service_1.successResponse('delete company successfull', null, res);
                                        }
                                        else {
                                            service_1.failureResponse('invalid company', null, res);
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
    delete_company_personel(req, res) {
        if (req.params.id && req.body.employee_id) {
            //TODO DELETE COMPANY FROM USER FIRST
            this.company_service.filterCompany({ _id: req.params.id }, (err, company_data) => {
                if (err) {
                    service_1.mongoError(err, res);
                }
                else {
                    this.user_service.filterUser({ _id: req.body.employee_id }, (err, user_data) => {
                        if (err) {
                            service_1.mongoError(err, res);
                        }
                        else {
                            // successResponse('get user successfull', user_data, res);
                            // console.log("get user : "+[user_data.companies]);
                            //REMOVE COMPANY FROM EMPLOYEE ARRAY ON USER OBJECT
                            for (let i = 0; i < user_data.employee_on.length; i++) {
                                const company = user_data.employee_on[i];
                                if (company.toString() === req.params.id) {
                                    user_data.employee_on.splice(i--, 1);
                                }
                            }
                            console.log("Deleted company from user company array: " + [user_data.employee_on]);
                            this.user_service.updateUser(user_data, (err) => {
                                if (err) {
                                    service_1.mongoError(err, res);
                                }
                                else {
                                    // successResponse('update user successfull', null, res);
                                    //Finally, delete from the company itself
                                    for (let i = 0; i < company_data.personel.length; i++) {
                                        const employee = company_data.personel[i];
                                        if (employee.toString() === req.body.employee_id) {
                                            company_data.personel.splice(i--, 1);
                                        }
                                    }
                                    this.company_service.updateCompany(company_data, (err) => {
                                        if (err) {
                                            service_1.mongoError(err, res);
                                        }
                                        else {
                                            service_1.successResponse('update company personel successfull', null, res);
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
exports.CompanyController = CompanyController;
