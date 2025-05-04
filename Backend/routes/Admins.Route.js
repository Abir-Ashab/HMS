const express = require("express");
const { AdminModel } = require("../models/Admin.model");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { NurseModel } = require("../models/Nurse.model");
const { DoctorModel } = require("../models/Doctor.model");
const { PatientModel } = require("../models/Patient.model");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const admins = await AdminModel.find();
    res.status(200).send(admins);
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Something went wrong" });
  }
});

router.post("/register", async (req, res) => {
  const { email } = req.body;
  try {
    const admin = await AdminModel.findOne({ email });
    if (admin) {
      return res.send({
        message: "Admin already exists",
      });
    }
    let value = new AdminModel(req.body);
    await value.save();
    const data = await AdminModel.findOne({ email });
    return res.send({ data, message: "Registered" });
  } catch (error) {
    res.send({ message: "error" });
  }
});

router.post("/login", async (req, res) => {
  const { adminID, password } = req.body;
  try {
    const admin = await AdminModel.findOne({ adminID, password });

    if (admin) {
      const token = jwt.sign({ foo: "bar" }, process.env.key, {
        expiresIn: "24h",
      });
      res.send({ message: "Successful", user: admin, token: token });
    } else {
      res.send({ message: "Wrong credentials" });
    }
  } catch (error) {
    console.log({ message: "Error" });
    console.log(error);
  }
});

router.patch("/:adminId", async (req, res) => {
  const id = req.params.adminId;
  const payload = req.body;
  try {
    const admin = await AdminModel.findByIdAndUpdate({ _id: id }, payload);
    if (!admin) {
      res.status(404).send({ msg: `Admin with id ${id} not found` });
    }
    res.status(200).send(`Admin with id ${id} updated`);
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Something went wrong, unable to Update." });
  }
});

router.delete("/:adminId", async (req, res) => {
  const id = req.params.adminId;
  try {
    const admin = await AdminModel.findByIdAndDelete({ _id: id });
    if (!admin) {
      res.status(404).send({ msg: `Admin with id ${id} not found` });
    }
    res.status(200).send(`Admin with id ${id} deleted`);
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Something went wrong, unable to Delete." });
  }
});

router.post("/password", async (req, res) => {
  const { email, userId, password } = req.body;

  try {
    if (!email || !userId || !password) {
      return res.status(400).send({ message: "Missing required fields" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL || "abiir.ashhab@gmail.com",
        pass: process.env.EMAIL_PASS || "zfik mxqh ueqq fgvj",
      },
    });

    const mailOptions = {
      from: process.env.EMAIL || "abiir.ashhab@gmail.com",
      to: email,
      subject: "Account ID and Password",
      text: `Your User ID: ${userId}\nPassword: ${password}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).send({ message: "Failed to send email" });
      }
      res.send({ message: "Password email sent successfully", info });
    });

  } catch (error) {
    console.error("Internal error in /password route:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

router.post("/forgot", async (req, res) => {
  const { email, type } = req.body;
  let user, userId, password;

  try {
    if (type === "nurse") {
      user = await NurseModel.find({ email });
      userId = user[0]?.nurseID;
      password = user[0]?.password;
    } else if (type === "patient") {
      user = await PatientModel.find({ email });
      userId = user[0]?.patientID;
      password = user[0]?.password;
    } else if (type === "admin") {
      user = await AdminModel.find({ email });
      userId = user[0]?.adminID;
      password = user[0]?.password;
    } else if (type === "doctor") {
      user = await DoctorModel.find({ email });
      userId = user[0]?.docID;
      password = user[0]?.password;
    }

    if (!user || user.length === 0) {
      return res.status(404).send({ message: "User not found" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "abiir.ashhab@gmail.com",
        pass: "zfik mxqh ueqq fgvj", // consider moving to process.env
      },
    });

    const mailOptions = {
      from: "abiir.ashhab@gmail.com",
      to: email,
      subject: "Account ID and Password",
      text: `Your User ID: ${userId}\nPassword: ${password}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Mail send error:", error);
        return res.status(500).send({ message: "Failed to send email" });
      }
      res.send({ message: "Password reset email sent" });
    });

  } catch (error) {
    console.error("Forgot route error:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

module.exports = router;
