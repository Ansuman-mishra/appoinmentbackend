const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    AppointmentId: { type: String, required: true, unique: true },
    Text: { type: String },
    description: { type: String },
    StartDate: { type: Date },
    EndDate: { type: Date },
    StartDate: { type: Date },
    AllDay: { type: Boolean, default: false },
    recurrenceRule: { type: String },
    recurrenceException: { type: String },
});

//  = settingSchema;

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;
