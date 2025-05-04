const express = require("express");
const { AppointmentModel } = require("../models/Appointment.model");

const router = express.Router();

// Get all appointments (with optional query)
router.get("/", async (req, res) => {
  let query = req.query;
  try {
    const appointments = await AppointmentModel.find(query);
    res.status(200).send(appointments);
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Something went wrong" });
  }
});

// Create a new appointment
router.post("/create", async (req, res) => {
  const payload = req.body;
  try {
    const appointment = new AppointmentModel(payload);
    await appointment.save();
    return res.send("Appointment successfully booked."); // return added
  } catch (error) {
    console.log(error);
    return res.status(400).send({ error: "Failed to book appointment" }); // better error handling
  }
});

// Update an appointment by ID
router.patch("/:appointmentId", async (req, res) => {
  const id = req.params.appointmentId;
  const payload = req.body;
  try {
    const appointment = await AppointmentModel.findByIdAndUpdate({ _id: id }, payload);
    if (!appointment) {
      return res.status(404).send({ msg: `Appointment with id ${id} not found` }); // return added
    }
    return res.status(200).send(`Appointment with id ${id} updated`); // return added
  } catch (error) {
    console.log(error);
    return res.status(400).send({ error: "Something went wrong, unable to Update." });
  }
});

// Delete an appointment by ID
router.delete("/:appointmentId", async (req, res) => {
  const id = req.params.appointmentId;
  try {
    const appointment = await AppointmentModel.findByIdAndDelete({ _id: id });
    if (!appointment) {
      return res.status(404).send({ msg: `Appointment with id ${id} not found` }); // return added
    }
    return res.status(200).send(`Appointment with id ${id} deleted`); // return added
  } catch (error) {
    console.log(error);
    return res.status(400).send({ error: "Something went wrong, unable to Delete." });
  }
});

module.exports = router;
