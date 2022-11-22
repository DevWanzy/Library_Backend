const router = require("express").Router();
const jwt = require("jsonwebtoken");
const moment = require("moment");

const con = require("../dbconnect");
const verify = require("./verifyToken");
const level = ["manager", "staff"];

router.post("/login", (req, res) => {
  con.query(
    `
    select id, name, level, image, suspended from staff 
    where name='${req.body.name}' and binary password='${req.body.password}'`,
    (e, r) => {
      if (e) return res.status(400).send(e);
      if (r.length < 1)
        return res.status(401).send("Invalid Username or Password");
      if (r[0].suspended == 1)
        return res
          .status(400)
          .send("Sorry, your account is suspended. Please contact the manager");
      var token = jwt.sign(
        { id: r[0].id, name: r[0].name, level: r[0].level, image: r[0].image },
        `${moment().format("YYMMDD")}Yob1993aa`
      );
      res.header("auth_token", token);
      return res.status(200).send({
        auth_token: token,
        user: {
          id: r[0].id,
          name: r[0].name,
          level: r[0].level,
          image: r[0].image,
        },
      });
    }
  );
});

router.post("/currentuser", verify, (req, res) => {
  return res.send(req.user);
});

router.post("/logout", verify, (req, res) => {
  var sql = "INSERT INTO discardedtokens (token) VALUES ( ? )";
  var values = [req.header("auth_token")];
  con.query(sql, [values], function (err, result) {
    if (err) {
      return res.status(400).send(err.code);
    }
    return res.send(`Successfuly Logged Out`);
  });
});

module.exports = router;
