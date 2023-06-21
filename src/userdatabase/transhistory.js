const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  senderName: {
    type: String,
    required: true
  },
  senderAccountNumber: {
    type: String,
    required: true
  },
  receiverName: {
    type: String,
    required: true
  },
  receiverAccountNumber: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
