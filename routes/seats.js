const router = require('express').Router()

const c = require('../dbconnect')

router.get('/', (req, res) => {
    c.query('select * from seats', (e, s) => {
        if (e) return res.status(400).send(e)
        return res.send(s)
    })
})

router.post('/', (req, res) => {
    // console.log(req.body)
    let addedseats = []
    for (let s = 0; s < req.body.quantity; s++) {
        let seat = { floor: req.body.floor, description: `${req.body.description}`, addedby: req.user.id }
        c.query('insert into seats set ? ', seat, (e, r) => {
            // console.log(e)
            if (e) return res.status(400).send(e)
            addedseats.push({ no: r.insertId, floor: req.body.floor, description: req.body.description, addedby: req.user.id })
        })
    }
    return res.send({ details: `${req.body.quantity.toLocaleString()} seats Added` })
})

router.post('/single', (req, res) => {
    let seat = { floor: req.body.floor, description: req.body.description, addedby: req.user.id }
    c.query('insert into seats set ? ', seat, (e, r) => {
        if (e) return res.status(400).send(e)
        return res.send(r)
    })
})

router.put('/:id', (req, res) => {
    c.query(`select * from seats where no = '${req.params.id}'`, (e, s) => {
        if (e) return res.status(400).send(e)
        if (s.length < 1) return res.status(404).send({ details: `seat no ${req.params.id} not found` })
        let seat = [req.body.floor, req.body.description]
        c.query(`update seats set floor = ?, description = ? where no = '${req.params.id}'`, seat, (e, r) => {
            if (e) return res.status(400).send(e)
            return res.send(r)
        })
    })
})

//get empty seats
router.get('/empty', (req, res) => {
    c.query(`select * from seats where seats.no not in (SELECT seat FROM students_attendance where timeout is null )`, (e, s) => {
        if (e) return res.status(400).send(e)
        if (s.length < 1) return res.status(404).send({ details: "All seats are occupied" })
        return res.send(s)
    })
})

//get occupied seats
router.get('/occupied', (req, res) => {
    c.query(`select * from students`, (e, st) => {
        if (e) return res.status(400).send(e)
        let sss = []
        c.query(`
            select *, no as setno,
(select regno from students_attendance where seat = setno order by timein desc limit 1 )as reg
 from seats where seats.no in 
(SELECT seat FROM students_attendance where timeout is null )
order by no
            `, (e, s) => {
            if (e) return res.status(400).send(e)
            if (s.length < 1) return res.status(404).send({ details: "All seats are empty" })
            s.forEach(s => {
                s.currentOccupant = st.filter(student => student.regno == s.reg)[0]
                sss.push(s);
            })
            return res.send(sss)
        })
    })
})

//seat history
router.get('/history/:no', (req, res) => {
    c.query(`select * from seats where no = '${req.params.no}'`, (e, ss) => {
        if (e) return res.status(400).send(e)
        if (ss.length < 1) return res.status(404).send({ details: `seat no ${req.params.no} not found` })
        c.query(`select * from students_attendance order by timein desc`, (e, sa) => {
            if (e) return res.status(400).send(e)
            c.query(`select * from seats where no='${req.params.no}'`, (e, seat) => {
                if (e) return res.status(400).send(e)
                seat[0].attendanceHistory = sa.filter(s => s.seat == seat[0].no)
                return res.send(seat[0])
            })
        })
    })
})

module.exports = router