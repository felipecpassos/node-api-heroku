"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./config/app");
let port = process.env.PORT || 3000;
app_1.default.listen(port, () => {
    console.log('Express server listening on port ' + port);
});
