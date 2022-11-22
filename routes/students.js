const router = require('express').Router()

const con = require('../dbconnect')

router.get('/', (req, res) => {
    con.query('select * from students', (e, s) => {
        if (e) return res.status(400).send(e)
        return res.send(s)
    })
})

router.get('/single', (req,res)=>{
    let std = { regno: req.query.regno }
    con.query(`select * from students where ? `, std, (e,s)=>{
        if(e) return res.status(400).send(e)
        if(s.length < 1) return res.status(404).send({details: `Student of regno ${req.query.regno.toUpperCase()} not found`})
        return res.send(s)
    })
})

router.post('/', (req, res) => {
    let std = {
        regno: req.body.regno.toUpperCase(),
        name: req.body.name.toUpperCase(),
        email: req.body.email.toLowerCase(),
        course: req.body.course.toUpperCase(),
        phone: req.body.phone,
        expiry: req.body.expiry,
        addedby: req.user.id
    }
    con.query('insert into students set ?', std, (e,s)=>{
        if(e) return res.status(400).send(e)
        return res.send(std)
    })
})

router.put('/', (req,res)=>{
    let std = {
        regno: req.body.regno.toUpperCase(),
        name: req.body.name.toUpperCase(),
        email: req.body.email.toLowerCase(),
        course: req.body.course.toUpperCase(),
        phone: req.body.phone,
        expiry: req.body.expiry
    }
    con.query(`select * from students where regno='${req.query.regno}'`, (err, r)=>{
        if(err) return res.status(400).send(err)
        if(r.length < 1) return res.status(404).send({details: `student of regno ${req.query.regno} was not found`})
        con.query(`update students set ? where regno = '${req.query.regno}'`, std, (e,u)=>{
            if(e) return res.status(400).send(e)
            return res.send(u)
        })
    })    
})

//student history
router.get('/history', (req, res) => {
    con.query(`select * from students where regno = '${req.query.regno}'`, (e, ss) => {
        if (e) return res.status(400).send(e)
        if (ss.length < 1) return res.status(404).send({ details: `student of regno ${req.query.regno} not found` })
        con.query(`select * from students_attendance order by timein desc`, (e, sa) => {
            if (e) return res.status(400).send(e)
            con.query(`select * from students where regno='${req.query.regno}'`, (e, seat) => {
                if (e) return res.status(400).send(e)
                seat[0].attendanceHistory = sa.filter(s => s.regno == seat[0].regno)
                return res.send(seat[0])
            })
        })
    })
})

module.exports = router