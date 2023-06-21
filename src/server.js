const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const port = 8000;
const users_TSF = require('./userdatabase/userdata');
const ContactMessage = require('./userdatabase/contact_message');
const Transaction = require('./userdatabase/transhistory');

require('./userdatabase/mongoose_connection.js');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

let mainfolder = path.join(__dirname, '../');

// Serve static files
app.use(express.static(path.join(mainfolder, 'public')));

app.get('/reg', (req, res) => {
  res.sendFile(path.join(mainfolder, 'reg.html'));
});

app.get('/acc', (req, res) => {
  // Retrieve the data from MongoDB
  users_TSF.find({})
    .then((users) => {
      // Pass the retrieved data to the template
      res.render('acc', { users: users });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('An error occurred');
    });
});

app.get('/trans', (req, res) => {
  // Retrieve the data from MongoDB
  users_TSF.find({})
    .then((users) => {
      // Pass the retrieved data to the template
      res.render('trans', { users: users });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('An error occurred');
    });
});

app.post('/trans', (req, res) => {
  const { fromaccount, toaccount, amount } = req.body;

  if (fromaccount === toaccount) {
    return res.send('<script>alert("Invalid account numbers! Cannot transfer to the same account."); window.location.href = "/trans";</script>');
  }

  if (amount < 500 || amount > 45000) {
    return res.send('<script>alert("Invalid transfer amount! Transfer amount should be between 500 and 45000."); window.location.href = "/trans";</script>');
  }

  // Find the sender's and receiver's account in the database
  Promise.all([
    users_TSF.findOne({ accountNumber: fromaccount }),
    users_TSF.findOne({ accountNumber: toaccount })
  ])
    .then(([senderAccount, receiverAccount]) => {
      if (!senderAccount || !receiverAccount) {
        return res.send('<script>alert("Invalid account numbers! One or both accounts not found."); window.location.href = "/trans";</script>');
      }

      if (senderAccount.initial_deposit < amount) {
        return res.send('<script>alert("Insufficient balance for transfer!"); window.location.href = "/trans";</script>');
      }

      users_TSF.updateOne(
        { accountNumber: fromaccount },
        { $inc: { initial_deposit: -amount } }
      )
        .then(() => {
          // Update sender's account successful
          // Now update the receiver's account
          users_TSF.updateOne(
            { accountNumber: toaccount },
            { $inc: { initial_deposit: amount } }
          )
            .then(() => {
              // Update receiver account

              // Create a new transaction document
              const transaction = new Transaction({
                senderName: senderAccount.fullname,
                senderAccountNumber: fromaccount,
                receiverName: receiverAccount.fullname,
                receiverAccountNumber: toaccount,
                amount,
                datetime: new Date()
              });

              // Save the transaction document in the database
              transaction.save()
                .then(() => {
                  // Transaction saved successfully
                  res.send('<script>alert("Transfer successful!"); window.location.href = "/acc";</script>');
                })
                .catch((error) => {
                  console.error(error);
                  // Handle the error and send an appropriate response
                  res.status(500).send('<script>alert("An error occurred while saving the transaction history!"); window.location.href = "/trans";</script>');
                });
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send('<script>alert("An error occurred while updating the receiver account!"); window.location.href = "/trans";</script>');
            });
        })
        .catch((error) => {
          console.error(error);
          res.status(500).send('<script>alert("An error occurred while updating the sender account!"); window.location.href = "/trans";</script>');
        });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('<script>alert("An error occurred while finding the sender or receiver account!"); window.location.href = "/trans";</script>');
    });
});

app.get('/history', (req, res) => {
  // Retrieve the data from MongoDB
  Transaction.find({})
    .then((users) => {
      // Pass the retrieved data to the template
      res.render('history', { users: users });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('An error occurred');
    });
});
app.get('/', (req, res) => {
  res.sendFile(path.join(mainfolder, 'index.html'));
});

app.post('/reg', (req, res) => {
  let req_userdata = new users_TSF(req.body);
  req_userdata
    .save()
    .then(() => {
      res.send('<script>alert("Registration Success!!."); window.location.href = "/acc";</script>');
      console.log(req_userdata);
    })
    .catch((err) => {
      console.error(err);
      const errorMessage = err.message || 'An error occurred. Please try again.';
      res.status(500).send(`<script>alert("${errorMessage}"); window.location.href = "/reg.html";</script>`);
    });
});

app.post('/cont', (req, res) => {
  let req_contact_message = new ContactMessage(req.body);
  req_contact_message
    .save()
    .then(() => {
      res.send('<script>alert("SENT SUCCESSFULLY!! WE WILL REACH YOU SOON!!."); window.location.href = "/index.html";</script>');
    })
    .catch((err) => {
      console.error(err);
      res.send('<script>alert("An error occurred!!. Try again!!."); window.location.href = "/cont.html";</script>');
    });
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
  console.log(__dirname);
});
