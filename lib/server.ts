import app from "./config/app";
import env from "./environment"

const PORT = env.getPort();
app.listen((process.env.PORT || PORT), () => {
   console.log('Express server listening on port ' + PORT);
})

