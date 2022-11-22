const conn = require("../dbconnect");
const jwt = require("jsonwebtoken");
const moment = require("moment");

module.exports = function (req, res, next) {
  const token = req.header("auth_token");
  if (!token) return res.status(401).send({ details: "Access Denied" });

  try {
    const verified = jwt.verify(token, `${moment().format("YYMMDD")}Yob1993aa`);
    conn.query(
      `select suspended from staff where id='${verified.id}'`,
      (ee, rr) => {
        if (ee) return res.status(400).send(ee);
        if (rr.length < 1)
          return res.status(401).send({ details: "Account Not Found" });
        if (rr[0].suspended == 1)
          return res.status(401).send({ details: "Account Suspended" });
        req.user = verified;
        return next();
      }
    );
  } catch (error) {
    if (error) return res.status(401).send({ details: "Invalid Token" });
  }
};
