const router = require("express").Router();
const con = require("../dbconnect");
const moment = require("moment");

router.post("/self", (req, res) => {
  let sa = {
    regno: req.body.regno,
    seat: req.body.seat,
  };
  con.query(`select * from students where regno='${sa.regno}'`, (e, s) => {
    if (e) return res.status(400).send(e);
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
                return res
                  .status(400)
                  .send({
                    details: `Seat ${sa.seat} is occupied by ${seat[0].regno}`,
                  });
              con.query(
                `insert into students_attendance set ? `,
                sa,
                (e, sta) => {
                  if (e) return res.status(400).send(e);
                  // console.log(s, sa)
                  return res.send(
                    `Hello ${
                      s[0].name
                    } you have assigned yourself Seat Number ${sa.seat} in ${
                      se[0].floor
                    } at ${moment().format("ddd, DD MMM YYYY hh:mm a")}`
                  );
                }
              );
            }
          );
        }
      );
    });
  });
});

router.get("/availableinfloor/:floor", (req, res) => {
  //get empty seats
  con.query(
    `select * from seats where seats.no not in (SELECT seat FROM students_attendance where timeout is null ) and seats.floor='${req.params.floor}'`,
    (e, s) => {
      if (e) return res.status(400).send(e);
      if (s.length < 1)
        return res.status(404).send({ details: "All seats are occupied" });
      return res.send(s);
    }
  );
});

module.exports = router;
