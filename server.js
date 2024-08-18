const express = require("express");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const { ValidationError } = require("express-validation");
const cors = require("cors");
const connectDB = require("./db");
const Appointment = require("./model/appointment");

const app = express();
app.use(cors());
const port = 5000;

app.use(bodyParser.json());

app.get("/api/appointments/Get", async (req, res) => {
    try {
        if (!req.query.filter) {
            const appointments = await Appointment.find();
            return res.json(appointments);
        }
        const filter = JSON.parse(req.query.filter);
        const buildQuery = (conditions) => {
            const query = [];
            conditions.forEach((condition) => {
                if (Array.isArray(condition)) {
                    if (condition.length === 3) {
                        const [field, operator, value] = condition;
                        let mongoCondition;
                        switch (operator) {
                            case ">=":
                                mongoCondition = { [field]: { $gte: new Date(value) } };
                                break;
                            case "<":
                                mongoCondition = { [field]: { $lt: new Date(value) } };
                                break;
                            case "startswith":
                                mongoCondition = { [field]: { $regex: `^${value}`, $options: "i" } };
                                break;
                            case "=":
                                mongoCondition = { [field]: value };
                                break;
                            default:
                                throw new Error(`Unsupported operator: ${operator}`);
                        }
                        query.push(mongoCondition);
                    } else if (Array.isArray(condition[0])) {
                        query.push(buildQuery(condition));
                    }
                } else if (typeof condition === "string") {
                    if (condition === "or") {
                        return { $or: query };
                    } else if (condition === "and") {
                        return { $and: query };
                    }
                }
            });
            return query.length > 1 ? { $and: query } : query[0];
        };
        const mongoQuery = buildQuery(filter);
        const appointments = await Appointment.find(mongoQuery);
        res.json(appointments);
    } catch (err) {
        console.error("Error retrieving appointments:", err);
        res.status(500).send("Error retrieving appointments");
    }
});

app.post("/api/appointments/create", async (req, res) => {
    const newAppointment = req.body;
    console.log("newAppointment :>> ", req.body);
    console.log("newAppointment :>> ", JSON.stringify(req.header));
    newAppointment.AppointmentId = uuidv4();
    const appointment = new Appointment(newAppointment);
    console.log("newAppointment :>> ", appointment);
    try {
        await appointment.save();
        res.status(201).send("Appointment created successfully.");
    } catch (err) {
        res.status(400).send("Error creating appointment");
    }
});

app.put("/api/appointments/Put/:id", async (req, res) => {
    const { id } = req.params;
    const updatedAppointment = req.body;
    try {
        const appointment = await Appointment.findOneAndUpdate({ AppointmentId: id }, updatedAppointment, { new: true, runValidators: true });
        if (!appointment) {
            return res.status(404).send("Appointment not found");
        }
        res.send("Appointment updated successfully.");
    } catch (err) {
        res.status(400).send("Error updating appointment");
    }
});

app.delete("/api/appointments/Delete/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const appointment = await Appointment.findOneAndDelete({ AppointmentId: id });
        if (!appointment) {
            return res.status(404).send("Appointment not found");
        }
        res.send("Appointment deleted successfully.");
    } catch (err) {
        res.status(400).send("Error deleting appointment");
    }
});

app.use((err, req, res, next) => {
    if (err instanceof ValidationError) {
        return res.status(err.statusCode).json(err);
    }
    return res.status(500).json(err);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    connectDB();
});
