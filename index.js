// npm install express sequelize sqlite3
const express = require('express'); //framework
const Sequelize = require('sequelize');
const app = express(); //app
const session = require('express-session');

// parse incoming requests
app.use(express.json()); // format to transfer data in json
app.use(session({
    secret:"secret",
    resave:false,
    saveUninitialized:true
}));

// create a connection to the database
const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite', // use format of sqlite
    storage: './Database/myshop.sqlite' // datavase store at
});

//USER
const User = sequelize.define('user', { // 'objectname', {object detail}
    userId: {
        type: Sequelize.CHAR,
        autoIncrement: true,
        primaryKey: true // make id to pk so can search by id
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    username: {
        type: Sequelize.VARCHAR,
        allowNull: false
    },
    userTel: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    address: {
        type: Sequelize.VARCHAR,
        allowNull: false
    }
});

//EMPLOYEE
const Employee = sequelize.define('employee', {
    employeeId :{
        type: Sequelize.CHAR,
        primaryKey: true,
        allowNull: false
    },
    employeeName : {
        type: Sequelize.VARCHAR,
        allowNull: false
    },
    employeeTel: {
        type: Sequelize.CHAR,
        allowNull: false
    }
});

//PRODUCT
const Product = sequelize.define('product', {
   productId :{
        type: Sequelize.CHAR,
        primaryKey: true,
        allowNull: false
    },
    nameproduct : {
        type: Sequelize.VARCHAR,
        allowNull: false
    },
    price: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

//PAYMENT
const Payment = sequelize.define('payment', { 
    orderId :{
        type: Sequelize.CHAR,
        primaryKey: true,
        allowNull: false
    },
    payment : {
        type: Sequelize.CHAR,
        allowNull: false
    },
    employeeId: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    userId : {
        type : Sequelize.CHAR,
        allowNull : false
    }
});

//ORDER
const Order = sequelize.define('order', { 
   orderId : {
    type : Sequelize.CHAR,
    primaryKey: true,
    allowNull : false
   },
    productId : {
        type : Sequelize.CHAR,
        allowNull : false
    },
    quantity : {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    totalprice : {
        type: Sequelize.INTEGER
    },
    employeeId: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    userId : {
        type : Sequelize.CHAR,
        allowNull : false
    }
});

//SYNC DATABASE
sequelize.sync();

//USERNAME&PASSWORD
async function authenUser(username, password){
    try {
        // Find a user with username
        const user = await User.findOne({
            where: {username: username}
        })
        //user is found 
        if (user) {
            if (user.password === password) { // check password matches ?
                return user; //correct, return the user
            }else {
                return "!password"; // password incorrect, return message
            }
        // user not found, return message
        } else {
            return "!username&!password"; 
        }
    } catch(error) {
        console.log('Error querying database:', error);
        throw error;
    }
}

//get all user
app.get('/user/getUser', (req, res) => {
    User.findAll().then(data => {
        if (data) res.json(data);
        else res.status(404).send("Can't find all user");
    }).catch(err => { res.status(500).send(err); });
});

//get user by id
app.get('/user/getUser/:id', (req,res) => {
    User.findByPk(req.params.id).then(data => {
        if (data) res.json(data);
        else res.status(404).send("Not found");
    }).catch(err => { res.status(500).send(err); });
});

//create user account
app.post('/user/register', (req, res) => {
    try {
        User.findAll().then(data => {
            let Alldata = [];
            let registerValid = true;
            let strError = "";
            if (data) {
                data.forEach(user => {
                    Alldata.push(user.dataValues.username);
                    Alldata.push(user.dataValues.userTel);
                    Alldata.push(user.dataValues.address);
                });

                if (Alldata.includes(req.body.username)) {
                   strError = "!username";
                   registerValid = false;
                }if (Alldata.includes(req.body.userTel)) {
                    strError += "!userTel";
                    registerValid = false;
                }
                if (Alldata.includes(req.body.address)) {
                    strError += "!address";
                    registerValid = false;
                }
                if (registerValid) {
                    User.create(req.body).then(data => {
                        res.json(data);
                        Cart.create({ // Generate Cart for new user
                            user_id: data.dataValues.userId
                        }).catch(err => { res.status(500).send(err); });
                    }).catch(err => { res.status(500).send(err); });
                }else { res.json({statusRegister: false, message: strError}); }
            } else res.send('Not Found');
        }).catch(err => { res.status(500).send(err); });
    } catch (err) { res.status(500).send(err); }
});

//create employee account
app.post('/employee/register', (req, res) => {
    try {
        Employee.findAll().then(data => {
            let Alldata = [];
            let registerValid = true;
            let strError = "";
            if (data) {
                data.forEach(user => {
                    Alldata.push(Employee.dataValues.employeeName);
                    Alldata.push(user.dataValues.employeeTel);
                });

                if (Alldata.includes(req.body.employeeName)) {
                   strError = "!employeeName";
                   registerValid = false;
                }if (Alldata.includes(req.body.employeeTel)) {
                    strError += "!employeeTel";
                    registerValid = false;
                }
                else { res.json({statusRegister: false, message: strError}); }
            } else res.send('Not Found');
        }).catch(err => { res.status(500).send(err); });
    } catch (err) { res.status(500).send(err); }
});

// route to login an account by using post
app.post('/user/login', async (req, res) => {
    try {
        const user = await authenUser(req.body.username, req.body.password);
        if (user === "!password") res.json({statuslogin: false, user: null, message: "!password"});
        else if (user === "!username&!password") res.json({statuslogin: false, user: null, message: "!username&!password"});
        else { res.json({statuslogin: true, user: user, message: "Login successfully!"}); }
    } catch (err) { 
        res.status(500).send(err);
    }
});

// route to update data of User
app.post('/user/update/:id', (req, res) => {
    try {
        User.findAll({
            where: {userId: {[Sequelize.Op.ne]: req.params.id}}
        }).then(data => {
            let Alldata = [];
            let updateValid = true;
            let strError = "";
            if (data) {
                data.forEach(user => {
                    Alldata.push(user.dataValues.username);
                    Alldata.push(user.dataValues.email);
                    Alldata.push(user.dataValues.phone);
                });

                if (Alldata.includes(req.body.username)) {
                   strError = "!username";
                   updateValid = false;
                }if (Alldata.includes(req.body.address)) {
                    strError += "!address";
                    updateValid = false;
                }if (Alldata.includes(req.body.phone)) {
                    strError += "!phone";
                    updateValid = false;
                }
                
                if (updateValid) {
                    User.findByPk(req.params.id).then(user => {
                        user.update(req.body).then(data => {
                            res.json({statusUpdate: true, user: data, message: 'Update success'});
                        }).catch(err => { res.status(500).send(err); });
                    }).catch(err => { res.status(500).send(err); });
                }else { res.json({statusUpdate: false, message: strError});  }
            } else res.json({statusUpdate: false, message: 'Not found'});
        }).catch(err => { res.status(500).send(err); })
    } catch (err) { res.status(500).send('Error'); }
});

//delete user
app.delete('/user/delete/:id', (req, res) => {
    User.findByPk(req.params.id).then(data => {
        if (data) {
            res.send(`Account: ${data.username} has been deleted`)
            data.destroy().catch(err => {
                res.status(500).send(err);
            });
        }else res.send(`Not found.`);
    }).catch(err => { res.status(500).send(err); });
});

//login employeee
app.post('/employee/login', async (req, res) => {
    try {
        const Employee = await authenEmployee(req.body.employeeName, req.body.password);
        if (Employee === "!password") res.json({statuslogin: false, employee: null, message: "!password"});
        else if (Employee === "!employeeName&!password") res.json({statuslogin: false, employee: null, message: "!employeeName&!password"});
        else { res.json({statuslogin: true, employee: Employee, message: "success"}); }
    } catch (err) { 
        res.status(500).send(err);
    }
});

//get all product
app.get('/product/all', (req, res) =>{
    Product.findAll().then(data => {
        if(data) res.json(data);
        else res.send("Not found");
    }).catch(err => { res.status(500).send(err); });
});

//get product by id
app.get('/product/get/:id', (req, res) => {
    Product.findByPk(req.params.id).then(data => {
        if (data) res.json(data);
        else res.send('Not found');
    }).catch(err => { res.status(500).send(err); });
});

// route to create data of Product
app.post('/product/new', (req, res) => {
    Product.findOne({
        where: {name: req.body.name}
    }).then(data => {
        if(data) res.send('already have this name!');
        else {
            Product.create(req.body).then(product => { res.json(product);
            }).catch(err => { res.status(500).send(err); });
        }
    }).catch(err => { res.status(500).send(err); });
});

//Update Product
app.post('/product/update/:id', (req, res) => {
    try {
        Product.findAll({
            where: {ProductId: {[Sequelize.Op.ne]: req.params.id}}
        }).then(data => {
            let Alldata = [];
            let updateValid = true;
            let strError = "";
            if (data) {
                data.forEach(product => { Alldata.push(product.dataValues.name); });

                if (Alldata.includes(req.body.name)) {
                   strError = `\nProduct name: "${req.body.name}" is already use`;
                   updateValid = false;
                }
                
                if (updateValid) {
                    Product.findByPk(req.params.id).then(product => {
                        product.update(req.body);
                        res.json({statusUpdate: true, data: product, message: 'Update success'});
                    }).catch(err => {
                        res.status(500).send(err);
                    });
                }else { 
                    res.json({statusUpdate: false, data: null, message: 'Update Fail' + strError + '\nPlease try again!'}); }
            } else res.send('Not Found');
        }).catch(err => { res.status(500).send(err); })
    } catch (err) { res.status(500).send('Error'); }
});

//delete Product
app.delete('/product/delete/:productid', (req, res) =>{
    Product.findByPk(req.params.id).then(data => {
        if(data) {
            res.json({message: `${data.name} has been delete`});
            data.destroy().catch(err => { res.status(500).send(err); });
        }else res.status(404).send("Not found");
    }).catch(err => { res.status(500).send(err); });
});

//add order
app.post('/order/add/:userId', async (req, res) => { // req.body => productId quantity
    //Parse char to Integer
    let productId = parseInt(req.params.productId); // pull data from id
    let OrderData = await Order.findOne({
        where: {user_id: req.params.userId}
    }).catch(err => {res.status(500).send(err);});
    let productData = await Product.findByPk(productId); 
    Order.findOne({
        where: {
            order_Id: req.body.order_Id,
            product_Id: productId
        }
    }).then(async (data) => {
        if (data) { //user add order.
            //update the quantity /cal totalprice
            let newQuantity = parseInt(data.quantity) + parseInt(req.body.quantity); // new quantity after update
            let totalprice = productData.price * newQuantity; // calculate totalprice
            data.update({
                quantity: newQuantity,
                totalprice : totalprice
            }).then(updateData => { res.json(updateData); 
            }).catch(err => {res.status(500).send(err);});
        }else { //user never order
            //create new order
            let totalprice = productData.price * parseInt(req.body.quantity);
            Order.create({
                order_Id: req.body.order_Id,
                product_Id: productId,
                quantity: req.body.quantity,
                totalprice: totalprice
            }).then(data => {
                if (data) res.json(data);
                else res.send("fail to order!");
            }).catch(err => { res.status(500).send(err); });
        }
    }).catch(err => { res.status(500).send(err); });
});

//update quantity in order
app.post('/order/update/:orderId', (req, res) => {
    Order.findByPk(req.params.orderId).then(data => {
        if (data) {
            Product.findByPk(data.product_id).then(productData => {
                let totalprice = pasrseInt(productData.price) * parseInt(req.body.quantity);
                data.update({
                    quantity: req.body.quantity,
                    totalprice: totalprice
                }).then(updateData => { res.json(updateData); 
                }).catch(err => {res.status(500).send(err);});
            }).catch(err => {res.status(500).send(err);});
        }else res.send("fail to update");
    });
});

//delete order
app.post('/order/delete/:orderId', (req, res) => {
    Order.findByPk(req.params.orderId).then(data => {
        if (data) {
            Order.findByPk(data.order_Id).then(productData => {
                res.send(`Deleted Product Name: ${productData.name}\nQuantity: ${data.quantity}\n Order deleted`);
            }).catch(err => {res.status(500).send(err);})
            data.destroy().catch(err => {res.status(500).send(err);})
        }else res.send("Fail to delete Order");
    });
});

// route to get all order
app.get('/order/getAll', (req,res) => {
    Order.findAll().then(data => {
        if (data) res.json(data);
        else res.send("Can't find all order");
    }).catch(err => res.status(500).send(err));
});

// route to get all new order
app.get('/order/getAll/new', (req,res) => {
    Order.findAll({
        where: {status: "order-received"}
    }).then(data => {
        if (data) res.json(data);
        else res.send("Can't find all order");
    }).catch(err => res.status(500).send(err));
});

// route to get all order of user by id
app.get('/order/getAll/:userId', (req,res) => {
    Order.findAll({
        where: {user_id: req.params.userId}
    }).then(data => {
        if (data) res.json(data);
        else res.send("Can't find all order of this user");
    }).catch(err => res.status(500).send(err));
});

// route to get order by id 
app.get('/order/detail/:orderId', (req,res) => {
    OrderDetail.findAll({
        where: {order_id: req.params.orderId}
    }).then(data => {
        if (data) res.json(data);
        else res.send("Can't find this order");
    }).catch(err => res.status(500).send(err));
});


//PORT
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening at http://localhost:${port}`));



