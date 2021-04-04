"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyPersonelRoutes = void 0;
const companyController_1 = require("../controllers/companyController");
class CompanyPersonelRoutes {
    constructor() {
        this.company_controller = new companyController_1.CompanyController();
    }
    route(app) {
        app.post('api/personel/:id', (req, res) => {
            console.log("OOOOPS");
            this.company_controller.add_personel(req, res);
        });
    }
}
exports.CompanyPersonelRoutes = CompanyPersonelRoutes;
