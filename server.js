const { append } = require('express/lib/response');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/customer_lattes_db')

const UUID = Sequelize.UUID;
const UUIDV4 = Sequelize.UUIDV4

const Latte = sequelize.define('latte', {
    id: {
        type: UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    name: {
        type: Sequelize.STRING
    }
})

const Customer = sequelize.define('customer', {
    id: {
        type: UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    name: {
        type: Sequelize.STRING
    },
    type: {
        type: Sequelize.ENUM('good review', 'bad review'),
        defaultValue: 'good review'
    }
})

Customer.belongsTo(Latte)
Latte.hasMany(Customer)

const express = require('express');
const app = express();
const path = require('path')

app.use('/src', express.static(path.join(__dirname, 'src')));

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

app.get('/review', (req, res, next) => res.sendFile(path.join(__dirname, 'index.html')))

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
        await sequelize.sync({ force: true })
        const matcha =  await Latte.create({ name: 'matcha latte'});
        const mocha =  await Latte.create({ name: 'mocha latte'});
        const vanilla =  await Latte.create({ name: 'vanilla latte'});
        const chai =  await Latte.create({ name: 'chai latte'});

        await Customer.create({ name: 'Maria Vang', latteId: matcha.id, type: 'bad review'})
        await Customer.create({ name: 'Christian Craft', latteId: matcha.id})
        await Customer.create({ name: 'Ethyl Webb', latteId: mocha.id})
        await Customer.create({ name: 'Dane Mcfadden', latteId: vanilla.id})
        await Customer.create({ name: 'Eliana Bates', latteId: chai.id, type: 'bad review'})
        await Customer.create({ name: 'Paulina Goulding', latteId: chai.id})

        const port = process.env.PORT || 3000;
        app.listen(port, console.log(`listening on port ${port}`))
        console.log('starting')
    }
    catch(ex) {
        console.log(ex)
    }
}

init()