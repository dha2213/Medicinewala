const express = require('express');
const path = require('path');
const morgan = require('morgan');
const { prohairesis } = require('prohairesis');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');
const session = require('express-session');
const { time } = require('console');
const { update } = require('list');
const { Int32, ConnectionCheckOutFailedEvent } = require('mongodb');
const { type } = require('os');

const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 5000;
var email1;
app.use(express.static(__dirname));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render(path.join(__dirname, 'homepage'), { 'session': session.loggedin, 'not_registered': 1, 'invalid': 1,'alreadyAccount':1 });
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

const bookSchema = new mongoose.Schema({
    Id: String, Type: String, UserId: String, DoctorId: String, DoctorName: String, DoctorField: String, TestId: String, TestName: String, TestResult: String, MedicineId: String, MedicineName: String, Date: Date, Quantity: Number
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
    Id: String, Name: String
});
const Test = mongoose.model('Test', testSchema);

const medSchema = new mongoose.Schema({
    Id: String, Name: String, Quantity: Number
});
const Medicine = mongoose.model('Medicine', medSchema);


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
    u_id = "U" + 0 + flag_u;
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
        b_id = "B" + 0 + flag_b;
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
app.post('/test_booking', (req, res) => {
    const { date, time, usrId, testIds } = req.body;
    if (!usrId) {
        res.render(path.join(__dirname, 'lab_test'), { 'session': session.loggedin, 'usr': null, 'testIds': null, 'booking': 'error', 'disease': -1 });
    }
    else {
        var arr = testIds.split(',');
        localStorage.getItem(flag_b);
        b_id = "B" + 0 + flag_b;
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
        let findQty=[];
        let findName=[];
        let tp = 0;
        let ps = false;
        const findToken = Math.floor(100000 + Math.random() * 900000);
        for (var i=0; i<medIds.length; i++) {
            mIds.push('M000' + (medIds[i] + 1));
        }
        for(var i=0; i<mIds.length; i++) {
            const quantity =  medQts[i];
            Medicine.findOne({'Id': mIds[i]}, (err, med) => {
                localStorage.getItem(flag_b);
                b_id = "B" +findToken;
                flag_b = flag_b + 1;
                localStorage.setItem(flag_b);
                const book = new Booking();
                if (med.Quantity-quantity>=0) {
                    med.Quantity = med.Quantity - quantity;
                    med.save();
                    User.findOne({'Email': session.email}, (err, usr) => {
                        book.Id = b_id; book.Type = 'Medicine'; book.UserId = usr.Id; book.MedicineId = med.Id;
                        book.MedicineName = med.Name; book.Quantity = quantity; let today = new Date().toISOString().slice(0, 10); book.Date = today;
                        findName[tp]=med.Name;
                        findQty[tp]=quantity;
                        tp++;
                        ps = true;
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
  
            let htmlContent = "<h1>Booking Confirmation!</h1>";
            let tr = "B"+findToken;
            // console.log(tr)
            // docs.forEach((doc) => {
            //   if(doc.Id==tr)
            //   console.log(doc.Id+""+doc. MedicineName+"--"+doc.Quantity );
            //   // htmlContent += "<p>Medicine Name: " + doc. MedicineName+ " Medicine Quantity: " + doc.Quantity + "</p>";
            // });
            docs.forEach((doc) => {
              if(doc.Id==tr)
              htmlContent += "<p>Medicine Name: " + doc. MedicineName+ " Medicine Quantity: " + doc.Quantity + "</p>";
            });
  
            const mailOptions = {
              from: 'medicinewala13@gmail.com', // Change this to your email address
              to: session.email,
              subject: 'Email Verification',
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
        
        res.render(path.join(__dirname, 'medicine'), { 'session': session.loggedin, 'booking': 'success' });
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