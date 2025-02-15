const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');
const User = require('./models/userModel');
const Expense = require('./models/expenseModel');
const sequelize = require('./utils/database');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'signup.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'login.html'));
});

app.get('/expense', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'expense.html'));
});

app.post('/user/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) throw new Error('All fields are required');

        const hashedPassword = await bcrypt.hash(password, 10);
        const data = await User.create({ name, email, password: hashedPassword });

        res.status(201).json({ data, message: 'Signup successfully✨' });
    } catch (err) {
        res.json({ message: 'error in signup backend' });
    }
});

app.post('/user/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) throw new Error('All fields are required');

        const user = await User.findOne({ where: { email } });
        if (!user) return res.json({ message: 'Email is not valid' });

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) return res.json({ message: 'password is not valid' });

        const token = generateAccessToken(user.id, user.name);
        res.status(200).json({ message: 'logged in successfully🎉', token });
    } catch (err) {
        res.json({ message: 'error in login backend' });
    }
});

app.post('/expense/add-expense', auth.authenticate, async (req, res) => {
    try {
        const { price, description, category, date } = req.body;
        if (!price || !description || !category || !date) throw new Error('All fields are required');

        const response = await Expense.create({ price, description, category, date, userId: req.user.id });
        res.status(201).json({ response, message: 'Expense added' });
    } catch (err) {
        res.json({ message: 'something wrong in add-expense backend' });
    }
});

app.get('/expense/get-expense', auth.authenticate, async (req, res) => {
    try {
        const data = await Expense.findAll({ where: { userId: req.user.id } });
        res.json({ data });
    } catch (err) {
        res.json({ message: 'something wrong in add-expense backend' });
    }
});

app.delete('/expense/delete-expense/:id', auth.authenticate, async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) throw new Error('id is required');

        await Expense.destroy({ where: { id, userId: req.user.id } });
        res.json({ message: 'Expense deleted' });
    } catch (err) {
        res.json({ message: 'something is wrong in delete-expense backend' });
    }
});

// Helper functions
function generateAccessToken(id, name) {
    return jwt.sign({ userId: id, name }, 'subhra@28');
}

// Database relations
User.hasMany(Expense);
Expense.belongsTo(User);

// Sync database and start server
sequelize.sync()
    .then(() => {
        app.listen(3000, () => console.log('Server running on PORT 3000'));
    })
    .catch(err => console.log(err));