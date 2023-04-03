'use strict'

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const { prohairesis } = require('prohairesis');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
var LocalStorage = require('node-localstorage').LocalStorage;
var localStorage = new LocalStorage('./scratch');
const session = require('express-session');
const { time } = require('console');
const { update } = require('list');
const { Int32, ConnectionCheckOutFailedEvent } = require('mongodb');
const { type } = require('os');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const app = express();

// const bodyParser = require('body-parser');
const cors = require("cors");
const dotenv = require("dotenv");
const Razorpay = require("razorpay");
const crypto = require("crypto");

dotenv.config();
app.use(express.json());
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use("/api/payment/", paymentRoutes);
const port = process.env.PORT || 5000;
var email1;
app.use(express.static(__dirname));
app.use(morgan('dev'));

app.use(require("body-parser").json());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render(path.join(__dirname, 'homepage'), { 'session': session.loggedin, 'not_registered': 1, 'invalid': 1,'alreadyAccount':1 });
});
app.post('/pharmacist', (req, res) => {
  res.render(path.join(__dirname, './pharmacist/homepage.ejs'), { 'session': session.loggedin, 'not_registered': 1, 'invalid': 1, 'alreadyAccount': 1 });
});
app.get('/contact', (req, res) => {
    res.render(path.join(__dirname, 'contact'), { 'session': session.loggedin });
});
app.get('/medicine', (req, res) => {
    res.render(path.join(__dirname, 'medicine'), { 'session': session.loggedin, 'booking': null });
});
app.get('/chatbot', (req, res) => {
    res.render(path.join(__dirname, 'chatpage'), { 'session': session.loggedin });
});

// mongoose.connect('mongodb+srv://medicinewala:medi1234@cluster0.17zxjdh.mongodb.net/test');
mongoose.connect('mongodb://127.0.0.1:27017/myapp');
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
    console.log("Connected successfully");
});

// const emailVerificationSchema = new mongoose.Schema({
//     token: {
//       type: String,
//       required: true,
//     },
//     otp: {
//       type: Number,
//       required: true,
//     },
//     verified: {
//       type: Boolean,
//       required: true,
//       default: false,
//     },
//   });

  const usrSchema = new mongoose.Schema({
    Id: String,
    Name: {
      type: String,
      required: true,
    },
    Email: {
      type: String,
      required: true,
      unique: true,
    },
    Password: {
      type: String,
      required: true,
    },
    Address: {
      type: String,
      required: true,
    },
    Phone: {
      type: String,
      required: true,
    },
    Bloodgroup: {
      type: String,
      required: true,
    },
    Gender: {
      type: String,
      required: true,
    },
    DOB: {
      type: Date,
      required: true,
    },
    emailVerification:{
        token: {
        type: String,
        required: true,
      },
      otp: {
        type: Number,
        required: true,
      },
      verified: {
        type: Boolean,
        required: true,
        default: false,
      },
    },
  });
// const usrSchema = new mongoose.Schema({
//     Id: String, Name: String, Email: String, Password: String, Address: String, Phone: Number, Bloodgroup: String, Gender: String, DOB: Date,
// emailVerification:{
//             token: {
//             type: String,
//             required: true,
//           },
//           otp: {
//             type: Number,
//             required: true,
//           },
//           verified: {
//             type: Boolean,
//             required: true,
//             default: false,
//           },
//         },
// });
const User = mongoose.model('User', usrSchema);
const pharmacistSchema = new mongoose.Schema({
  Id: String,
  Name: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
    unique: true,
  },
  Password: {
    type: String,
    required: true,
  },
  Address: {
    type: String,
    required: true,
  },
  Phone: {
    type: String,
    required: true,
  },
  Gender: {
    type: String,
    required: true,
  },
  DOB: {
    type: Date,
    required: true,
  },
  emailVerification: {
    token: {
      type: String,
      required: true,
    },
    otp: {
      type: Number,
      required: true,
    },
    verified: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
});
// const pharmacistSchema = new mongoose.Schema({
//   // Id: String, Type: String, UserId: String, DoctorId: String, DoctorName: String, DoctorField: String, TestId: String, TestName: String, TestResult: String, MedicineId: String, MedicineName: String, Date: Date, Quantity: Number
//   Id: String, Name: String, Quantity: Number
// });
const pharmacist = mongoose.model('pharmacist', pharmacistSchema);
const bookSchema = new mongoose.Schema({
    Id: String,Price: Number, Type: String, UserId: String, DoctorId: String, DoctorName: String, DoctorField: String, TestId: String, TestName: String, TestResult: String, MedicineId: String, MedicineName: String, Date: Date, Quantity: Number
});
const Booking = mongoose.model('Booking', bookSchema);

const querySchema = new mongoose.Schema({
    Name: String, Email: String, Contact: Number, Comment: String
});
const Query = mongoose.model('Query', querySchema);

const docSchema = new mongoose.Schema({
    Id: String, Name: String, Phone: Number, Email: String, Qualification: String, Field: String, Experience: String, DOJ: Date
});
const Doctor = mongoose.model('Doctor', docSchema);

const testSchema = new mongoose.Schema({
    Id: String, Name: String,Price: Number
});
const Test = mongoose.model('Test', testSchema);

const medSchema = new mongoose.Schema({
    Id: String, Price: Number, Expirydate: Date, Name: String, Quantity: Number
});
const Medicine = mongoose.model('Medicine', medSchema);

const addressSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  }
});

const Address = mongoose.model('Address', addressSchema);

var flag_u1 = 1;
localStorage.setItem(flag_u1);

app.post('/pharmaSignup', (req, res) => {
  const { name, email, password, address, cntc, gender, dob, avatar } = req.body;

  localStorage.getItem(flag_u1);
  var u_id = "U" + 0 + flag_u1;
  flag_u = flag_u1 + 1;
  localStorage.setItem(flag_u);

  // Check if user already exists with this email
  // var tr = 0
  console.log(email)
  pharmacist.findOne({ Email: email })
    .then((user) => {
      if (user) {
        // User already exists with this email
        res.render(path.join(__dirname, './pharmacist/homepage.ejs'), { 'session': session.loggedin, 'not_registered': 1, 'invalid': 0, 'alreadyAccount': 0 });
        return;
      }

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000);

      // Create user with hashed password
      bcrypt.hash(password, 10)
        .then((hashedPassword) => {
          const user = new pharmacist({
            Id: u_id,
            Name: name,
            Email: email,
            Password: password,
            Address: address,
            Phone: cntc,
            Gender: gender,
            DOB: dob,
            emailVerification: {
              token: uuidv4(),
              otp,
              verified: false,
            },
          });


          // Save user to database
          console.log(email)
          user.save();
        })
        .then(() => {
          // Send OTP to user's email
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'medicinewala13@gmail.com', // Change this to your email address
              pass: 'obgnbityicxuzwqi', // Change this to your email password or use environment variable
            },
          });

          const mailOptions = {
            from: 'medicinewala13@gmail.com', // Change this to your email address
            to: email,
            subject: 'Email Verification',
            html: `<p>Your OTP for email verification is: <strong>${otp}</strong></p>`,
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
              // do something useful
            }
          });
        })
        .then(() => {
          console.log(email)
          email1 = email
          res.render(path.join(__dirname, './pharmacist/pharmaverifyotp.ejs'), {
            email: email,
            error: '',
          });
          return;
        })
        .catch((err) => console.log(err.message));
    })
    .catch((err) => console.log(err.message));
});
app.post('/pharmaverifyotp', (req, res) => {

  const { otp } = req.body;
  // const email = req.query.email;
  console.log(otp)
  console.log(email1)
  pharmacist.findOne({ Email: email1 })
    .then((user) => {
      // console.log(email1)
      // console.log(user)
      if (!user) {
        console.log(user)
        // User not found with this email
        res.render(path.join(__dirname, './pharmacist/pharmaverifyotp.ejs'), {
          email: email1,
          error: 'User not found with this email!',
        });
        return;
      }

      if (user.emailVerification.otp != otp) {
        res.render(path.join(__dirname, './pharmacist/pharmaverifyotp.ejs'), {
          email: email1,
          error: 'Invalid OTP. Please try again!',
        });
        return;
      }

      // console.log('jaykishorw')
      // OTP is valid. Set email verification to verified and save user details to database.
      user.emailVerification.verified = true;
      user.save()
        .then(() => {
          session.loggedin = true;
          session.email = email1;
          res.render(path.join(__dirname, './pharmacist/homepage.ejs'), { 'session': session.loggedin, 'not_registered': 0, 'invalid': 0, 'alreadyAccount': 1 });
          return;
        })
        .catch(err => console.log(err.message));
    })
    .catch((err) => console.log(err.message));
});

app.post('/pharmaresendotp', (req, res) => {
  // const { email } = req.body;

  pharmacist.findOne({ Email: email1 })
    .then((user) => {
      if (!user) {
        // User not found with this email
        res.render(path.join(__dirname, './pharmacist/pharmaverifyotp.ejs'), {
          email: email1,
          error: 'User not found with this email!',
        });
        return;
      }

      // Generate new OTP and save to user details in database
      const newOtp = Math.floor(100000 + Math.random() * 900000);
      user.emailVerification.otp = newOtp;
      user.save()
        .then(() => {
          // Send new OTP to user's email
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'medicinewala13@gmail.com', // Change this to your email address
              pass: 'obgnbityicxuzwqi', // Change this to your email password or use environment variable
            },
          });

          const mailOptions = {
            from: 'medicinewala13@gmail.com', // Change this to your email address
            to: email1,
            subject: 'Email Verification',
            html: `<p>Your new OTP for email verification is: <strong>${newOtp}</strong></p>`,
          };

          transporter.sendMail(mailOptions);
        })
        .then(() => {
          res.render(path.join(__dirname, './pharmacist/pharmaverifyotp.ejs'), {
            email: email1,
            error: '',
          });
          return;
        })
        .catch((err) => console.log(err.message));
    })
    .catch((err) => console.log(err.message));
});
app.post('/pharmalogin', (req, res) => {
  const { email, psw } = req.body;

  //   //dhananjay yadav
  //   User.findById(req.body.Id)
  // .then(user => {
  //   const  verified = req.body.emailVerification.verified;
  //   console.log(verified); // will log either `true` or `false`
  // })
  // .catch(error => {
  //   console.error(error);
  // });
  pharmacist.findOne({ 'Email': email }, 'Password', (err, user) => {
    if (!user) {
      res.render(path.join(__dirname, './pharmacist/homepage.ejs'), { 'session': session.loggedin, 'not_registered': 1, 'invalid': 0, 'alreadyAccount': 1 });
    }

    else if (user.Password == psw) {
      session.loggedin = true;
      session.email = email;
      res.render(path.join(__dirname, './pharmacist/homepage'), { 'session': session.loggedin, 'not_registered': 0, 'invalid': 0, 'alreadyAccount': 1 });
    } else if (user.Password != psw) {
      res.render(path.join(__dirname, './pharmacist/homepage'), { 'session': session.loggedin, 'not_registered': 0, 'invalid': 1, 'alreadyAccount': 1 });
    }
  });
});

app.get('/pharmaprofile', (req, res) => {
  if (session.loggedin) {
    pharmacist.findOne({ 'Email': session.email }, (err, user) => {
          // Booking.find({ 'UserId': user.Id }, (err, book) => {
              const name = user.Name;
              const [f, s, l] = name.split(' ')
              user.f = f;
              // var consult=[]; var test=[]; var med=[];
              // for( var i=0; i<book.length; i++) {
              //     if (book[i].Type=='Consultation') {
              //         consult.push(book[i]);
              //     } else if (book[i].Type == 'Lab Test') {
              //         test.push(book[i]);
              //     } else {
              //         med.push(book[i]);
              //     }
              // }   
              res.render(path.join(__dirname, './pharmacist/pharmaprofile'), { 'usr': user});
          // });
      });
  }
  else {
      res.send('Please login to view this page.');
  }
});
app.post('/Updatemedicine', (req, res) => {
  if (!session.loggedin) {
    res.render(path.join(__dirname, './pharmacist/homepage.ejs'), { 'session': session.loggedin, 'booking': 'error' });
  } else {

    const { medicinename, price, expirydate, quantity } = req.body
    const med = new Medicine({
      Name: medicinename,
      Price: price,
      Expirydate: expirydate, 
      Quantity: quantity

    })

    // Save user to database
    // console.log(email)
    med.save();
    res.render(path.join(__dirname, './pharmacist/homepage.ejs'), { 'session': session.loggedin, 'not_registered': 0, 'invalid': 0, 'alreadyAccount': 1 });
  }
});
var flag_u = 1;
localStorage.setItem(flag_u);
// app.post('/signup', (req, res) => {
//     const { name, email_add, password, address, cntc, blood, gender, dob } = req.body;
//     localStorage.getItem(flag_u);
//     u_id = "U" + 0 + flag_u;
//     flag_u = flag_u + 1;
//     localStorage.setItem(flag_u);
//     const usr = new User();
//     usr.Id = u_id; usr.Name = name; usr.Email = email_add; usr.Password = password; usr.Address = address; usr.Phone = cntc;
//     usr.Bloodgroup = blood; usr.Gender = gender; usr.DOB = dob;
//     usr.save()
//         .then(() => {
//             session.loggedin = true;
//             session.email = email_add;
//             res.render(path.join(__dirname, 'homepage'), { 'session': session.loggedin, 'not_registered': 0, 'invalid': 0 });
//         })
//         .catch(err => console.log(err.message));
// });
app.post('/signup', (req, res) => {
    const { name, email, password, address, cntc, blood, gender, dob } = req.body;
  
    localStorage.getItem(flag_u);
    var u_id = "U" + 0 + flag_u;
    flag_u = flag_u + 1;
    localStorage.setItem(flag_u);

    // Check if user already exists with this email
    // var tr = 0
    console.log(email)
    User.findOne({ Email: email })
      .then((user) => {
        console.log('maya')
        if (user) {
          // User already exists with this email
          console.log('jay')
          res.render(path.join(__dirname, 'homepage'),{ 'session': session.loggedin, 'not_registered': 1, 'invalid': 0,'alreadyAccount':0 });
          return;
        }
  
        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000);
  
        // Create user with hashed password
        bcrypt.hash(password, 10)
          .then((hashedPassword) => {
            const user = new User({
              Id:u_id,
              Name:name,
              Email:email,
              Password:password,
              Address: address,
              Phone: cntc,
              Bloodgroup: blood,
              Gender:gender,
              DOB:dob,
              emailVerification: {
                token: uuidv4(),
                otp,
                verified: false,
              },
            });
  
            
            // Save user to database
            console.log(email)
            user.save();
          })
          .then(() => {
            // Send OTP to user's email
            const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: 'medicinewala13@gmail.com', // Change this to your email address
                pass: 'obgnbityicxuzwqi', // Change this to your email password or use environment variable
              },
            });
  
            const mailOptions = {
              from: 'medicinewala13@gmail.com', // Change this to your email address
              to: email,
              subject: 'Email Verification',
              html: `<p>Your OTP for email verification is: <strong>${otp}</strong></p>`,
            };
  
            transporter.sendMail(mailOptions, function(error, info){
              if (error) {
             console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
                // do something useful
              }
            });
          })
          .then(() => {
            console.log(email)
            email1 = email
            res.render(path.join(__dirname, 'verifyotp'), {
              email: email,
              error: '',
            });
            return;
          })
          .catch((err) => console.log(err.message));
      })
      .catch((err) => console.log(err.message));
  });
  
  app.post('/verifyotp', (req, res) => {
    
    const { otp } = req.body;
    // const email = req.query.email;
    console.log(otp)
    console.log(email1)
    User.findOne({ Email: email1 })  
      .then((user) => {
        // console.log(email1)
        // console.log(user)
        if (!user) {
          console.log(user)
          // User not found with this email
          res.render(path.join(__dirname, 'verifyotp'), {
            email: email1,
            error: 'User not found with this email!',
          });
          return;
        }
        
        if (user.emailVerification.otp != otp) {
          res.render(path.join(__dirname, 'verifyotp'), {
            email: email1,
            error: 'Invalid OTP. Please try again!',
          });
          return;
        }
  
        // console.log('jaykishorw')
        // OTP is valid. Set email verification to verified and save user details to database.
        user.emailVerification.verified = true;
        user.save()
        .then(() => {
                      session.loggedin = true;
                      session.email = email1;
                      res.render(path.join(__dirname, 'homepage'), { 'session': session.loggedin, 'not_registered': 0, 'invalid': 0,'alreadyAccount':1 });
                      return;
                  })
                  .catch(err => console.log(err.message));
      })
      .catch((err) => console.log(err.message));
  });
  
  app.post('/resendotp', (req, res) => {
    // const { email } = req.body;
  
    User.findOne({ Email: email1})
    .then((user) => {
    if (!user) {
    // User not found with this email
    res.render(path.join(__dirname, 'verifyotp'), {
    email: email1,
    error: 'User not found with this email!',
    });
    return;
    }

      // Generate new OTP and save to user details in database
  const newOtp = Math.floor(100000 + Math.random() * 900000);
  user.emailVerification.otp = newOtp;
  user.save()
    .then(() => {
      // Send new OTP to user's email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'medicinewala13@gmail.com', // Change this to your email address
          pass: 'obgnbityicxuzwqi', // Change this to your email password or use environment variable
        },
      });

      const mailOptions = {
        from: 'medicinewala13@gmail.com', // Change this to your email address
        to: email1,
        subject: 'Email Verification',
        html: `<p>Your new OTP for email verification is: <strong>${newOtp}</strong></p>`,
      };

    transporter.sendMail(mailOptions);
    })
    .then(() => {
      res.render(path.join(__dirname, 'verifyotp'), {
        email: email1,
        error: '',
      });
      return;
    })
    .catch((err) => console.log(err.message));
})
.catch((err) => console.log(err.message));
});


let p = 0;
app.post('/submitAddress', (req, res) => {
  const address = new Address({
    name: req.body.name,
    mobile: req.body.mobile,
    pincode: req.body.pincode,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    country: req.body.country
  });
 const price = p;
 console.log(price)
  address.save().then(() => {
    console.log('Address saved to database');
    res.render(path.join(__dirname, 'payment'), { 'session': session.loggedin,
      price:price,
      email: email1,
      error: 'User not found with this email!',
      });
    // res.redirect('/payment.ejs');
  }).catch((err) => {
    console.error(err);
    res.redirect('/error.html');
  });
});

// var instance = new Razorpay({
//   key_id: 'rzp_test_YMP1b4R5kixkm3',
//   key_secret: 'RdqFAzAH0I5tHxJsPqJuZnKq',
// });

// app.post('/processpayment', async (req, res) => {
//   const paymentMethod = req.body.paymentMethod;
//   let amount = 1; // Replace with the actual amount

//   if (paymentMethod === 'wallet') {
//     const walletOption = req.body.walletOption;
//     // Handle wallet payments
//   } else if (paymentMethod === 'upi') {
//     const upiId = req.body.upiId;
//     // Handle UPI payments
//   } else if (paymentMethod === 'netbanking') {
//     const netbankingID = req.body.netbankingID;
//     // Handle netbanking payments
//   } else if (paymentMethod === 'card') {
//     const cardNumber = req.body.cardNumber;
//     const expiryDate = req.body.expiryDate;
//     const cvv = req.body.cvv;

//     // Create a new payment
//     const paymentOptions = {
//       amount: amount,
//       currency: 'INR',
//       payment_capture: 1,
//       notes: {
//         order_id: 'ORDER_ID',
//       },
//     };
//     instance.orders.create(options, function(err, order) {
//       console.log(order);
//       res.send({orderId: order.id});
//     });
//     // const payment = await razorpay.orders.create(paymentOptions);

//     // Render the payment page with the payment details
//     // res.render('payment', {
//     //   paymentId: payment.id,
//     //   amount: payment.amount,
//     //   currency: payment.currency,
//     //   keyId: razorpay.key_id,
//     //   name: 'Medicinewala',
//     //   description: 'Payment for Order ID: ORDER_ID',
//     //   image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrh7DPnttqNv-l0eNbd6p0bw-JVDg8A415ALHYDntOcy3pfSk9UxO6PRPdNgwqXY0AabU&usqp=CAU',
//     //   orderId: payment.notes.order_id,
//     //   email: 'Medicinewala13@gmail.com',
//     //   contact: '8741055817',
//     //   cardNumber: cardNumber,
//     //   expiryDate: expiryDate,
//     //   cvv: cvv,
//     // });
//   }
// });

// app.post('/create/orderId',(req,res)=>{
//   console.log("create order id requuest",req.body);
//   var options = {
//     amount: 1,
//     currency: 'INR',
//     reciept:"rcp-1"
//   };
//   instance.orders.create(options, function(err, order) {
//     console.log(order);
//     res.send({orderId: order.id});
//   });
// })

// app.post("/api/payment/verify",(req,res)=>{

//   let body=req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id;
 
//    var crypto = require("crypto");
//    var expectedSignature = crypto.createHmac('sha256', 'RdqFAzAH0I5tHxJsPqJuZnKq')
//                                    .update(body.toString())
//                                    .digest('hex');
//                                    console.log("sig received " ,req.body.response.razorpay_signature);
//                                    console.log("sig generated " ,expectedSignature);
//    var response = {"signatureIsValid":"false"}
//    if(expectedSignature === req.body.response.razorpay_signature)
//     response={"signatureIsValid":"true"}
//        res.send(response);
//    });
 
//  app.listen(port, () => {
//    console.log(`Example app listening at http://localhost:${port}`)
//  })

// app.post("/processpayment", async (req, res) => {
// 	try {
// 		const instance = new Razorpay({
// 			key_id: process.env.KEY_ID,
// 			key_secret: process.env.KEY_SECRET,
// 		});

// 		const options = {
// 			amount: req.body.amount * 100,
// 			currency: "INR",
// 			receipt: crypto.randomBytes(10).toString("hex"),
// 		};

// 		instance.orders.create(options, (error, order) => {
// 			if (error) {
// 				console.log(error);
// 				return res.status(500).json({ message: "Something Went Wrong!" });
// 			}
// 			res.status(200).json({ data: order });
// 		});
// 	} catch (error) {
// 		res.status(500).json({ message: "Internal Server Error!" });
// 		console.log(error);
// 	}
// });

// app.post("/verify", async (req, res) => {
// 	try {
// 		const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
// 			req.body;
// 		const sign = razorpay_order_id + "|" + razorpay_payment_id;
// 		const expectedSign = crypto
// 			.createHmac("sha256", process.env.KEY_SECRET)
// 			.update(sign.toString())
// 			.digest("hex");

// 		if (razorpay_signature === expectedSign) {
// 			return res.status(200).json({ message: "Payment verified successfully" });
// 		} else {
// 			return res.status(400).json({ message: "Invalid signature sent!" });
// 		}
// 	} catch (error) {
// 		res.status(500).json({ message: "Internal Server Error!" });
// 		console.log(error);
// 	}
// });
  
app.post('/login', (req, res) => {
    const { email, psw } = req.body;
    User.findOne({ 'Email': email }, 'Password', (err, user) => {
        if (!user) {
            res.render(path.join(__dirname, 'homepage'), { 'session': session.loggedin, 'not_registered': 1, 'invalid': 0 ,'alreadyAccount':1});
        } else if (user.Password == psw) {
            session.loggedin = true;
            session.email = email;
            res.render(path.join(__dirname, 'homepage'), { 'session': session.loggedin, 'not_registered': 0, 'invalid': 0 ,'alreadyAccount':1});
        } else if (user.Password != psw) {
            res.render(path.join(__dirname, 'homepage'), { 'session': session.loggedin, 'not_registered': 0, 'invalid': 1 ,'alreadyAccount':1});
        }
    });
});

app.get('/profile', (req, res) => {
    if (session.loggedin) {
        User.findOne({ 'Email': session.email }, (err, user) => {
            Booking.find({ 'UserId': user.Id }, (err, book) => {
                const name = user.Name;
                const [f, s, l] = name.split(' ')
                user.f = f;
                var consult=[]; var test=[]; var med=[];
                for( var i=0; i<book.length; i++) {
                    if (book[i].Type=='Consultation') {
                        consult.push(book[i]);
                    } else if (book[i].Type == 'Lab Test') {
                        test.push(book[i]);
                    } else {
                        med.push(book[i]);
                    }
                }   
                res.render(path.join(__dirname, 'profile'), { 'usr': user, 'consult': consult, 'test': test, 'med': med});
            });
        });
    }
    else {
        res.send('Please login to view this page.');
    }
});

app.post('/logout', (req, res) => {
    session.loggedin = false;
    session.email = null;
    res.render(path.join(__dirname, 'homepage'), { 'session': session.loggedin, 'not_registered': 1, 'invalid': 1,'alreadyAccount':1 });
});

app.get('/consultation', (req, res) => {
    if (session.loggedin) {
        User.findOne({ 'Email': session.email }, (err, user) => {
            Doctor.find({}, (err, doc) => {
                res.render(path.join(__dirname, 'consultation'), { 'docs': doc, 'session': session.loggedin, 'usr': user, 'booking': null, 'docId': null });
            });
        });
    } else {
        Doctor.find({}, (err, doc) => {
            res.render(path.join(__dirname, 'consultation'), { 'docs': doc, 'session': session.loggedin, 'usr': null, 'booking': null, 'docId': null });
        });
    }
});

var book_consult_docId = '';
app.post('/book_doctor', (req, res) => {
    book_consult_docId = req.body.doctorId;
    if (session.loggedin) {
        User.findOne({ 'Email': session.email }, (err, user) => {
            Doctor.find({}, (err, doc) => {
                res.render(path.join(__dirname, 'consultation'), { 'docs': doc, 'session': session.loggedin, 'usr': user, 'booking': null, 'docId': book_consult_docId });
            });
        });
    } else {
        Doctor.find({}, (err, doc) => {
            res.render(path.join(__dirname, 'consultation'), { 'docs': doc, 'session': session.loggedin, 'usr': null, 'booking': null, 'docId': book_consult_docId });
        });
    }
});

var flag_b = 1;
localStorage.setItem(flag_b);
app.post('/consult_booking', (req, res) => {
    const { date, time, usrId, doctorId } = req.body;
    if (!usrId) {
        Doctor.find({}, (err, doc) => {
            res.render(path.join(__dirname, 'consultation'), { 'docs': doc, 'session': session.loggedin, 'usr': null, 'booking': 'error', 'docId': null });
        });
    }
    else {
        localStorage.getItem(flag_b);
        var b_id = "B" + 0 + flag_b;
        flag_b = flag_b + 1;
        localStorage.setItem(flag_b);
        const book = new Booking();
        book.Id = b_id; book.Type = "Consultation"; book.UserId = usrId; book.DoctorId = doctorId; book.Date = date;
        Doctor.findOne({'Id': doctorId}, (err, doc1) => {
            book.DoctorName = doc1.Name;
            book.DoctorField = doc1.Field;
            book.save().then(() => {
                User.findOne({ 'Id': usrId }, (err, user) => {
                    Doctor.find({}, (err, doc) => {
                        res.render(path.join(__dirname, 'consultation'), { 'docs': doc, 'session': session.loggedin, 'usr': user, 'booking': 'success', 'docId': null });
                    });
                });
            })
            .catch(err => console.log(err));
        });
        }
});

app.get('/lab_test', (req, res) => {
    if (session.loggedin) {
        User.findOne({ 'Email': session.email }, (err, user) => {
            res.render(path.join(__dirname, 'lab_test'), { 'session': session.loggedin, 'usr': user, 'testIds': null, 'booking': null, 'disease': -1 });
        });
    } else {
        res.render(path.join(__dirname, 'lab_test'), { 'session': session.loggedin, 'usr': null, 'testIds': null, 'booking': null, 'disease': -1 });
    }
});

app.post('/book_test', (req, res) => {
    var testIds = Object.keys(req.body).map((key) => [req.body[key]] );
    if (session.loggedin) {
        User.findOne({ 'Email': session.email }, (err, user) => {
            res.render(path.join(__dirname, 'lab_test'), { 'session': session.loggedin, 'usr': user, 'testIds': testIds, 'booking': null, 'disease': -1 });
        });
    } else {
        res.render(path.join(__dirname, 'lab_test'), { 'session': session.loggedin, 'usr': null, 'testIds': testIds, 'booking': null, 'disease': -1 });
    }
});
var flag_b=1;
app.post('/test_booking', (req, res) => {
    const { date, time, usrId, testIds } = req.body;
    if (!usrId) {
        res.render(path.join(__dirname, 'lab_test'), { 'session': session.loggedin, 'usr': null, 'testIds': null, 'booking': 'error', 'disease': -1 });
    }
    else {
        var arr = testIds.split(',');
        localStorage.getItem(flag_b);
        var b_id = "B" + 0 + flag_b;
        flag_b = flag_b + 1;
        localStorage.setItem(flag_b);
        for (var i=0; i<arr.length; i++) {
            Test.findOne({'Id': arr[i]}, (err, test) => {
                const book = new Booking();
                book.Id = b_id; book.Type = "Lab Test"; book.UserId = usrId; book.TestId = test.Id; book.TestName = test.Name; book.Date = date;
                book.save();
            });
        }
        User.findOne({ 'Id': usrId }, (err, user) => {
            res.render(path.join(__dirname, 'lab_test'), { 'session': session.loggedin, 'usr': user, 'testIds': null, 'booking': 'success', 'disease': -1 });
        });
    }
})

app.post('/disease_prediction', (req, res) => {
    const { sex, age, restbps, chol, thalach, oldpeak, cp, fbs, recg, exang, slope, ca, thal } = req.body;
    var asex = [0, 0], acp = [0, 0, 0, 0], afbs = [0, 0], arecg = [0, 0, 0], aexang = [0, 0], aslope = [0, 0, 0], aca = [0, 0, 0, 0, 0], athal = [0, 0, 0, 0];
    asex[sex] = 1; acp[cp] = 1; afbs[fbs] = 1; arecg[recg] = 1; aexang[exang] = 1; aslope[slope] = 1; aca[ca] = 1; athal[thal] = 1;
    var list = []; list.push(age); list.push(restbps); list.push(chol); list.push(thalach);
    list.push(oldpeak);
    var final_list = list.concat(asex, acp, afbs, arecg, aexang, aslope, aca, athal);
    const spawn = require("child_process").spawn;
    const pythonProcess = spawn('python3', ["/home/denny3010/Desktop/Software_lab/MedCompanion/predict/predict.py", final_list]);
    pythonProcess.stdout.on('data', (data) => {
        var output = String.fromCharCode.apply(null, data).slice(0, 1)
        User.findOne({ 'Email': session.email }, (err, usr) => {
            res.render(path.join(__dirname, 'lab_test'), { 'session': session.loggedin, 'usr': usr, 'testIds': null, 'booking': null, 'disease': Number(output) });
        });
    });
});

var flag_b = 1;
localStorage.setItem(flag_b);
app.post('/book_medicine', (req, res) => {
    if (!session.loggedin) {
        res.render(path.join(__dirname, 'medicine'), { 'session': session.loggedin, 'booking': 'error' });
    } else {
        
        var tempMedIds = Object.values(req.body)
        var flagQts = true;
        const medQts = []; const medIds = [];
        for (var i=0; i<tempMedIds.length; i++) {
            if (tempMedIds[i]) {
                medIds.push(i);
                medQts.push(Number(tempMedIds[i]));
            } else {
                continue;
            }
        }
        const mIds=[];
        // let findQty=[];
        // let findName=[];
        // let tp = 0;
        // let ps = false;
        const findToken = Math.floor(100000 + Math.random() * 900000);
        for (var i=0; i<medIds.length; i++) {
            mIds.push('M000' + (medIds[i] + 1));
        }


        for(var i=0; i<mIds.length; i++) {
          const quantity =  medQts[i];
          Medicine.findOne({'Id': mIds[i]}, (err, med) => {
            p +=med.Price*quantity;
          })
        }
        res.render(path.join(__dirname, 'address'), { 
          'session': session.loggedin,
          price:p});
        // return;
        for(var i=0; i<mIds.length; i++) {
            const quantity =  medQts[i];
            Medicine.findOne({'Id': mIds[i]}, (err, med) => {
                localStorage.getItem(flag_b);
                var b_id = "B" +findToken;
                flag_b = flag_b + 1;
                localStorage.setItem(flag_b);
                const book = new Booking();
                if (med.Quantity-quantity>=0) {
                    med.Quantity = med.Quantity - quantity;
                    med.save();
                    User.findOne({'Email': session.email}, (err, usr) => {
                        book.Id = b_id; book.Type = 'Medicine'; book.UserId = usr.Id; book.MedicineId = med.Id; book.Price=med.Price;
                        book.MedicineName = med.Name; book.Quantity = quantity; let today = new Date().toISOString().slice(0, 10); book.Date = today;
                        // findName[tp]=med.Name;
                        // findQty[tp]=quantity;
                        // tp++;
                        // ps = true;
                        book.save();
                    }); 
                } else{
                    flagQts = false;                
                    res.render(path.join(__dirname, 'medicine'), { 'session': session.loggedin, 'booking': 'insufficient'});
                }
            });
        }
        setTimeout(function() {
          // Code to execute after 10 seconds
          Booking.find({}, (err, docs) => {
            // console.log(Id)
            if (err) {
              console.error(err);
              return;
            }
            // Iterate over each document and log its fields
            // Send OTP to user's email
            const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: 'medicinewala13@gmail.com', // Change this to your email address
                pass: 'obgnbityicxuzwqi', // Change this to your email password or use environment variable
              },
            });
  
            let htmlContent = "<h1>Your Booking has Confirmed!</h1>";
            let tr = "B"+findToken;
            // console.log(tr)
            // docs.forEach((doc) => {
            //   if(doc.Id==tr)
            //   console.log(doc.Id+""+doc. MedicineName+"--"+doc.Quantity );
            //   // htmlContent += "<p>Medicine Name: " + doc. MedicineName+ " Medicine Quantity: " + doc.Quantity + "</p>";
            // });
            docs.forEach((doc) => {
              if(doc.Id==tr)
              htmlContent += "<p>Medicine Name: " + doc. MedicineName+ " Medicine Quantity: " + doc.Quantity + " Price: "+ doc.Price+ "</p>";
            });
  
            htmlContent += "<p>Total price: "+ p+"</p>";
            htmlContent += "<h2>Thank you for your booking.</h2>";
            const mailOptions = {
              from: 'medicinewala13@gmail.com', // Change this to your email address
              to: session.email,
              subject: 'Confirmation of your medicine booking.',
              html: htmlContent,
            };
  
            transporter.sendMail(mailOptions, function(error, info){
              if (error) {
             console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
                // do something useful
              }
            });
          });
        }, 10000);
        
        // res.render(path.join(__dirname, 'medicine'), { 'session': session.loggedin, 'booking': 'success' });
      }    
});

app.post('/contact_us', (req, res) => {
    const { name, Email, Number, comment } = req.body;
    const query = new Query();
    query.Name = name; query.Email = Email; query.Contact = Number; query.Comment = comment;
    query.save();
    res.render(path.join(__dirname, 'contact'), { 'session': session.loggedin });
});


app.listen(port);