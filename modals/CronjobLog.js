const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cronJobLogSchema = new mongoose.Schema({
  status: { type: String, enum: ['Success', 'Failure'] },
  cronjob_type: { type: String },
  reason: { type: String },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CronJobLog', cronJobLogSchema);

