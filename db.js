const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/customer_lattes_db')

const UUID = Sequelize.UUID
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

const syncAndSeed = async() => {
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
    }
    catch(ex) {
        console.log(ex)
    }
}

module.exports = {
    models: {
        Latte,
        Customer
    },
    sequelize,
    syncAndSeed
}