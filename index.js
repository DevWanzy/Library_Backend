const app = require("express")();
const http = require("http").Server(app);
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const verify = require("./routes/verifyToken");

const assRoute = require("./routes/assign");
const seatsRoute = require("./routes/seats");
const studentsRoute = require("./routes/students");
const stdattRoute = require("./routes/studentattendance");
const authRoute = require("./routes/authentication");

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cors());
app.use(bodyParser.json());

app.use("/assign", assRoute);
app.use("/seats", verify, seatsRoute);
app.use("/students", verify, studentsRoute);
app.use("/studentsattendance", verify, stdattRoute);
app.use("/auth", authRoute);

const port = process.env.PORT;

http.listen(port, () => console.log(`Server Running at port ${port}`));
