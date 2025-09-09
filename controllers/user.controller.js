const customerModel = require('../models/user.model')

exports.getSignup = (req, res) => {
    res.render('signup')}

exports.getDashboard = (req, res) => {
    customerModel.find()
        .then((data) => {
            console.log(data);
            allCustomers = data;
            res.render('index', { allCustomers });
        })
        .catch((err) => {
            console.error('Error fetching customers:', err);
            res.status(500).send('Internal server error');
        })
}

exports.getRegister = (req, res) => {
    console.log(req.body);
    // res.send('Confirmed again')
    // allCustomers.push(req.body)
    let newCustomer = new customerModel(req.body);
    newCustomer.save()
        .then(() => {
            res.redirect('/dashboard');
        })
        .catch((err) => {
            console.log('Error registering customer:', err);
        })
}

exports.postSignup = (req, res) => {
    res.render('signup')
}

exports.postSignin = (req, res) => {
    res.render('signin')
}