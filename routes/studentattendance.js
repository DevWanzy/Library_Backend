const router = require("express").Router();
const moment = require("moment");

const con = require("../dbconnect");

router.get("/", (req, res) => {
  con.query("select * from students_attendance", (e, a) => {
    if (e) return res.status(400).send(e);
    return res.send(a);
  });
});

router.post("/", (req, res) => {
  let sa = {
    regno: req.body.regno,
    seat: req.body.seat,
  };
  con.query(`select * from students where regno='${sa.regno}'`, (e, s) => {
    if (e) return res.status(400).send("error");
    if (s.length < 1)
      return res
        .status(404)
        .send({ details: `student of regno ${sa.regno} was not found` });
    con.query(`select * from seats where no = '${sa.seat}'`, (e, se) => {
      if (e) return res.status(400).send(e);
      if (se.length < 1)
        return res
          .status(404)
          .send({ details: `seat of number ${sa.seat} was not found` });
      //check if student is in
      con.query(
        `select * from students_attendance where regno='${sa.regno}' and timeout is null`,
        (e, t) => {
          if (e) return res.status(400).send(e);
          if (t.length > 0)
            return res
              .status(400)
              .send({ details: `${s[0].name} - ${s[0].regno} is already in` });
          //check seat availability
          con.query(
            `select * from students_attendance where seat='${sa.seat}' and timeout is null`,
            (e, seat) => {
              if (e) return res.status(400).send(e);
              if (seat.length > 0)
                return res.status(400).send({
                  details: `Seat ${sa.seat} is occupied by ${seat[0].regno}`,
                });
              con.query(
                `insert into students_attendance set ? `,
                sa,
                (e, sta) => {
                  if (e) return res.status(400).send(e);
                  return res.send(sta);
                }
              );
            }
          );
        }
      );
    });
  });
});

router.post("/signout", (req, res) => {
  console.log(req.body.regno);
  con.query(
    `select * from students where regno='${req.body.regno}'`,
    (err, r) => {
      if (err) return res.status(400).send(err);
      if (r.length < 1)
        return res.status(404).send({
          details: `student of regno ${req.body.regno} was not found`,
        });
      con.query(
        `select * from students_attendance where regno='${req.body.regno}' and timeout is not null order by timeout desc limit 1`,
        (e, ts) => {
          if (e) return res.status(400).send(e);
          if (ts.length > 0)
            return res.status(400).send({
              details: `${r[0].name} - ${r[0].regno} is already signed out`,
              lastlog: ts[0],
            });
          con.query(
            `select * from students_attendance where regno='${req.body.regno}' and timeout is null`,
            (e, tt) => {
              if (e) return res.status(400).send(e);
              con.query(
                `update students_attendance set timeout= '${moment(
                  new Date()
                ).format("YYYY-MM-DD HH:mm:ss")}' where id='${tt[0].id}'`,
                (e, r) => {
                  if (e) return res.status(400).send(e);
                  console.log(r);
                  return res.send(r);
                }
              );
            }
          );
        }
      );
    }
  );
});

module.exports = router;
