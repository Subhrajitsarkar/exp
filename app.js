let express = require('express');
let app = express()
let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
let path = require('path');
let cors = require('cors');
app.use(cors())
let bcrypt = require('bcrypt')
app.use(express.static(path.join(__dirname, 'public')))

let User = require('./models/userModel')
let sequelize = require('./utils/database');
const Expense = require('./models/expenseModel');

app.get('/', async (req, res) => {
    res.sendFile((path.join(__dirname, 'public', 'views', 'signup.html')))
})
app.get('/login', async (req, res) => {
    res.sendFile((path.join(__dirname, 'public', 'views', 'login.html')))
})
app.get('/expense', async (req, res) => {
    res.sendFile((path.join(__dirname, 'public', 'views', 'expense.html')))
})

app.post('/user/signup', async (req, res) => {
    try {
        let { name, email, password } = req.body;
        if (!name || !email || !password)
            throw new Error('All fields are required')
        let hashedPassword = await bcrypt.hash(password, 10)
        let data = await User.create({ name, email, password: hashedPassword })

        res.status(201).json({ data, message: 'Signup successfully✨' })
    } catch (err) {
        res.json({ message: 'error in signup backend' })
    }
})

app.post('/user/login', async (req, res) => {
    try {
        let { email, password } = req.body;
        if (!email || !password)
            throw new Error('All fields are required')
        let user = await User.findOne({ where: { email } })
        if (!user)
            return res.json({ message: 'Email is not valid' })
        let isValidPassword = await bcrypt.compare(password, user.password)
        if (!isValidPassword)
            return res.json({ message: 'password is not valid' })
        res.status(200).json({ message: 'logged in successfully🎉' })
    }
    catch (err) {
        res.json({ message: 'error in login backend' })
    }
})

app.post('/expense/add-expense', async (req, res) => {
    try {
        let { price, description, category, date } = req.body;
        if (!price || !description || !category || !date)
            throw new Error('All fields are required')
        let response = await Expense.create({ price, description, category, date })
        res.status(201).json({ response, message: 'Expense added' })
    }
    catch (err) {
        res.json({ message: 'something wrong in add-expense backend' })
    }
})

app.get('/expense/get-expense', async (req, res) => {
    try {
        let data = await Expense.findAll()
        res.json({ data })
    } catch (err) {
        res.json({ message: 'something wrong in add-expense backend' })
    }
})

app.delete('/expense/delete-expense/:id', async (req, res) => {
    try {
        let id = req.params.id;
        await Expense.findOne({ where: { id } })
        if (!id)
            throw new Error('id is required')
        await Expense.destroy({ where: { id } })
        res.json({ message: 'Expense deleted' })
    } catch (err) {
        res.json({ message: 'something is wrong in delete-expense backend' })
    }
})
User.hasMany(Expense);
Expense.belongsTo(User)

sequelize.sync()
    .then(() => {
        app.listen(3000, () => console.log('synced successfully'))
    })
    .catch(err => console.log(err))