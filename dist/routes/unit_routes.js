"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitRoutes = void 0;
const unitController_1 = require("../controllers/unitController");
class UnitRoutes {
    constructor() {
        this.unit_controller = new unitController_1.UnitController();
    }
    route(app) {
        app.post('/api/unit', (req, res) => {
            this.unit_controller.create_unit(req, res);
        });
        app.get('/api/unit/:id', (req, res) => {
            this.unit_controller.get_unit(req, res);
        });
        // app.get('/api/unit', (req: Request, res: Response) => {
        //     this.unit_controller.get_all_units(req, res);
        // })
        app.put('/api/unit/:id', (req, res) => {
            this.unit_controller.update_unit(req, res);
        });
        app.delete('/api/unit/:id', (req, res) => {
            this.unit_controller.delete_unit(req, res);
        });
    }
}
exports.UnitRoutes = UnitRoutes;
