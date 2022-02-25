const { syncAndSeed, models: { Latte, Customer }, sequelize } = require('./db')

const express = require('express')
const app = express()
const path = require('path')

app.use('/src', express.static(path.join(__dirname, 'src')));

app.get('/review', (req, res, next) => res.sendFile(path.join(__dirname, 'index.html')))

app.delete('/review/:id', async(req, res, next) => {
    try {
        const customer = await Customer.findByPk(req.params.id);
        await customer.destroy();
        res.sendStatus(204)
    }
    catch(ex) {
        next(ex)
    }
})

app.get('/', (req, res) => res.redirect('/latte'));

app.get('/latte', async(req, res, next) => {
    try {
        const lattes = await Latte.findAll()
        const html = lattes.map (latte => {
            return `
            <li>
                ${latte.name.slice(0, 1).toUpperCase()}${latte.name.slice(1)}
            </li>
            `
        }).join('')
        res.send(`
        <html
        <head>
            <title>Sunsweet's Latte Shop!</title>
        </head>
        <body>
            <h1>Sunsweet's Latte Menu</h1>
            <ul>
                ${ html }
            </ul>
            Not sure what to get? Click <a href='/review'>here</a> for reviews!
        </body>
        `)
    }
    catch(ex) {
        next(ex)
    }
})

app.get('/badReviews', async(req, res, next) => {
    try {
        res.send(await Customer.findAll({
                where: {
                    type: 'bad review'
                },
                include: [ Latte ]
            }))
    }
    catch(ex) {
        next(ex)
    }
})

app.get('/goodReviews', async(req, res, next) => {
    try {
        res.send(await Customer.findAll({
                where: {
                    type: 'good review'
                },
                include: [ Latte ]
            }))
    }
    catch(ex) {
        next(ex)
    }
})

const init = async() => {
    try {
        await syncAndSeed()
        const port = process.env.PORT || 3000;
        app.listen(port, console.log(`listening on port ${port}`))
        console.log('starting')
    }
    catch(ex) {
        console.log(ex)
    }
}

init()