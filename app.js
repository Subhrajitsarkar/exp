const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');
let Razorpay = require('razorpay')
const User = require('./models/userModel');
const Expense = require('./models/expenseModel');
let Order = require('./models/orderModel')
const sequelize = require('./utils/database');
require('dotenv').config()

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

// Helper functions
function generateAccessToken(id, name, ispremiumuser) {
    return jwt.sign({ userId: id, name, ispremiumuser }, 'subhra@28');
}

// filepath: /C:/Users/subhrajit/Desktop/exp/app.js
app.post('/user/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) throw new Error('All fields are required');

        const user = await User.findOne({ where: { email } });
        if (!user) return res.json({ message: 'Email is not valid' });

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) return res.json({ message: 'password is not valid' });

        const token = generateAccessToken(user.id, user.name, user.ispremiumuser);
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

app.get('/razorpay/premiummembership', auth.authenticate, async (req, res) => {
    try {
        let rzp = new Razorpay({
            key_id: process.env.KEY_ID,
            key_secret: process.env.KEY_SECRET,
        })
        let amount = 10000
        let options = {
            amount: amount,
            currency: "INR",
            receipt: `order_rcptid_${new Date().getTime()}`,
        }
        let order = await rzp.orders.create(options)
        await req.user.createOrder({ orderid: order.id, status: "PENDING" })
        res.json({ order, key_id: rzp.key_id });
    } catch (err) {
        res.json({ message: 'something went wrong in premiummembership backend' });
    }
});

app.post('/razorpay/updatetransactionstatus', auth.authenticate, async (req, res) => {
    try {
        let { order_id, payment_id } = req.body;
        let order = await Order.findOne({ where: { orderid: order_id } })
        if (!order)
            res.json({ message: 'Order not found' })
        let promise1 = order.update({ paymentid: payment_id, status: 'SUCCESSFUL' })
        let promise2 = req.user.update({ ispremiumuser: true })
        await Promise.all([promise1, promise2]);
        res.json({ success: true, message: 'You are a premium user now', token: generateAccessToken(req.user.id, req.user.name, true) })
    }
    catch (err) {
        res.json({ message: 'something went wrong in updatetransactionstatus backend' });
    }
})

// Database relations
User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User)

// Sync database and start server
sequelize.sync()
    .then(() => {
        app.listen(3000, () => console.log('Server running on PORT 3000'));
    })
    .catch(err => console.log(err));