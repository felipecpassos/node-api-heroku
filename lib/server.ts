import app from "./config/app";
import env from "./environment"

let port = process.env.PORT || 3000;
app.listen(port, () => {
   console.log('Express server listening on port ' + port);
})

