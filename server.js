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

app.get('/', (req, res) => res.redirect('/drinks'));

app.get('/drinks', async(req, res, next) => {
    try {
        const badCustomers = await Customer.findAll({
            where: {
                type: 'bad review'
            },
            include: [ Latte ]
        });
        const goodCustomers = await Customer.findAll({
            where: {
                type: 'good review'
            },
            include: [ Latte ]
        })
        const html1 = badCustomers.map (customer => {
            return `
            <div>
                ${customer.name} says that her least favorite drink is the ${customer.latte.name}.
            </div>
            `
        }).join('');
        const html2 = goodCustomers.map (customer => {
            return `
            <div>
                ${customer.name} says that her favorite drink is the ${customer.latte.name}.
            </div>
            `
        }).join('');
        res.send(`
        <html
        <head>
            <title>Sunsweet's Latte Shop!</title>
        </head>
        <body>
            <h1>Sunsweet's Latte Review</h1>
            ${html1}
            ${html2}
        </body>
        </html>
        `)
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