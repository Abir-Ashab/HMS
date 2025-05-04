import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { CreatePayment, CreateReport } from "../../../../../Redux/Datas/action";
import Sidebar from "../../GlobalFiles/Sidebar";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { jsPDF } from "jspdf";

const notify = (text) => toast(text);

const Discharge_and_Create_Slip = () => {
  // Inline CSS styles
  const styles = `
    /* Styles for the PDF button and layout */
    .report-buttons {
      display: flex;
      gap: 15px;
      margin-top: 20px;
    }

    .pdf-button {
      background-color: #4caf50 !important;
      color: white;
      cursor: pointer;
    }

    .pdf-button:hover {
      background-color: #3e8e41 !important;
    }

    .pdf-button:disabled {
      background-color: #cccccc !important;
      cursor: not-allowed;
    }

    /* Styles for the medicines list table */
    .medicines-list {
      margin-top: 15px;
      margin-bottom: 25px;
      padding: 15px;
      border: 1px solid #e0e0e0;
      border-radius: 5px;
      background-color: #f9f9f9;
    }

    .medicines-list h3 {
      margin-top: 0;
      color: #333;
      font-size: 16px;
      margin-bottom: 10px;
    }

    .medicines-table {
      width: 100%;
      border-collapse: collapse;
    }

    .medicines-table th, 
    .medicines-table td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }

    .medicines-table th {
      background-color: #f2f2f2;
      font-weight: bold;
    }

    .medicines-table tr:hover {
      background-color: #f5f5f5;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .report-buttons {
        flex-direction: column;
      }
      
      .medicines-table {
        font-size: 14px;
      }
    }
  `;

  const { data } = useSelector((store) => store.auth);
  const [loading, setLoading] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);
  const formRef = useRef(null);

  const dispatch = useDispatch();
  const initmed = {
    medName: "",
    dosage: "",
    duration: "",
  };
  const [med, setmed] = useState(initmed);

  const [medicines, setmedicines] = useState([]);

  const HandleMedChange = (e) => {
    setmed({ ...med, [e.target.name]: e.target.value });
  };

  const InitData = {
    docName: "",
    docDepartment: "",
    patientAge: "",
    docMobile: "",
    patientMobile: "",
    patientBloodGroup: "",
    patientGender: "",
    email: "",
    patientDisease: "",
    patientTemperature: "",
    patientWeight: "",
    patientBP: "",
    patientGlucose: "",
    patientName: "",
    extrainfo: "",
    date: "",
    time: "",
    medicines: [],
  };

  const [ReportValue, setReportValue] = useState(InitData);

  const HandleReportChange = (e) => {
    setReportValue({ ...ReportValue, [e.target.name]: e.target.value });
  };

  const HandleMedAdd = (e) => {
    e.preventDefault();
    setmedicines([...medicines, med]);
    setmed(initmed);
  };

  // Custom function to draw a table without using autoTable
  const drawTable = (doc, data, headers, startY) => {
    const margin = 20;
    const cellPadding = 5;
    const fontSize = 10;
    const rowHeight = 10;
    
    // Page width and margins
    const pageWidth = doc.internal.pageSize.width;
    const tableWidth = pageWidth - 2 * margin;
    
    // Calculate column widths
    const colCount = headers.length;
    const colWidth = tableWidth / colCount;
    
    // Set font for headers
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'bold');
    
    // Draw header row
    doc.setFillColor(66, 135, 245);
    doc.setTextColor(255, 255, 255);
    
    // Draw header cells
    for (let i = 0; i < colCount; i++) {
      doc.rect(margin + i * colWidth, startY, colWidth, rowHeight, 'F');
      doc.text(
        headers[i],
        margin + i * colWidth + cellPadding,
        startY + rowHeight - cellPadding / 2
      );
    }
    
    // Set font for data
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    // Draw data rows
    let currentY = startY + rowHeight;
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      // Background color alternating for rows
      if (i % 2 === 0) {
        doc.setFillColor(240, 240, 240);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      
      // Draw row background
      doc.rect(margin, currentY, tableWidth, rowHeight, 'F');
      
      // Draw cell borders and text
      for (let j = 0; j < colCount; j++) {
        doc.setDrawColor(200, 200, 200);
        doc.rect(margin + j * colWidth, currentY, colWidth, rowHeight, 'S');
        doc.text(
          row[j].toString(),
          margin + j * colWidth + cellPadding,
          currentY + rowHeight - cellPadding / 2
        );
      }
      
      currentY += rowHeight;
    }
    
    return currentY; // Return the Y position after the table
  };

  const generatePDF = () => {
    setPdfGenerating(true);
    
    try {
      // Create a new jsPDF instance
      const doc = new jsPDF();
      
      // Add header
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 255);
      doc.text("Medical Report", 105, 15, { align: "center" });
      
      // Add hospital info
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("Hospital Management System", 105, 25, { align: "center" });
      doc.text("Generated on: " + new Date().toLocaleString(), 105, 30, { align: "center" });
      
      // Add line separator
      doc.setLineWidth(0.5);
      doc.line(20, 35, 190, 35);
      
      // Doctor information
      doc.setFontSize(14);
      doc.text("Doctor Information", 20, 45);
      doc.setFontSize(10);
      doc.text(`Doctor Name: ${reportData.docName}`, 25, 55);
      doc.text(`Department: ${reportData.docDepartment}`, 25, 60);
      doc.text(`Contact: ${reportData.docMobile}`, 25, 65);
      
      // Patient information
      doc.setFontSize(14);
      doc.text("Patient Information", 20, 80);
      doc.setFontSize(10);
      doc.text(`Name: ${reportData.patientName}`, 25, 90);
      doc.text(`Age: ${reportData.patientAge}`, 25, 95);
      doc.text(`Gender: ${reportData.patientGender}`, 25, 100);
      doc.text(`Blood Group: ${reportData.patientBloodGroup}`, 25, 105);
      doc.text(`Contact: ${reportData.patientMobile}`, 25, 110);
      doc.text(`Email: ${reportData.email}`, 25, 115);
      
      // Medical information
      doc.setFontSize(14);
      doc.text("Medical Information", 20, 130);
      doc.setFontSize(10);
      doc.text(`Disease/Condition: ${reportData.patientDisease}`, 25, 140);
      doc.text(`Temperature: ${reportData.patientTemperature}°C`, 25, 145);
      doc.text(`Weight: ${reportData.patientWeight} kg`, 25, 150);
      doc.text(`Blood Pressure: ${reportData.patientBP} mmHg`, 25, 155);
      doc.text(`Glucose: ${reportData.patientGlucose} mg/dL`, 25, 160);
      
      if (reportData.extrainfo) {
        doc.text(`Additional Notes: ${reportData.extrainfo}`, 25, 165);
      }
      
      // Date and time
      doc.text(`Date: ${reportData.date}`, 25, 175);
      doc.text(`Time: ${reportData.time}`, 25, 180);
      
      // Medications
      doc.setFontSize(14);
      doc.text("Prescribed Medications", 20, 195);
      
      // Create medication table data
      const medTableData = reportData.medicines.map((med, index) => [
        (index + 1).toString(), 
        med.medName, 
        med.duration, 
        med.dosage
      ]);
      
      // Draw medications table using our custom function
      const tableHeaders = ['No.', 'Medicine', 'Schedule', 'Dosage'];
      const finalY = drawTable(doc, medTableData, tableHeaders, 200);
      
      // Footer
      doc.setFontSize(10);
      doc.text("This is a computer-generated report.", 105, finalY + 15, { align: "center" });
      doc.text("Thank you for choosing our services.", 105, finalY + 20, { align: "center" });
      
      // Save the PDF
      doc.save(`${reportData.patientName}_medical_report.pdf`);
      
      setPdfGenerating(false);
      notify("PDF Generated Successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      setPdfGenerating(false);
      notify("Error generating PDF: " + error.message);
    }
  };

  const HandleReportSubmit = (e) => {
    e.preventDefault();
    let data = {
      ...ReportValue,
      medicines,
    };
    try {
      setLoading(true);
      dispatch(CreateReport(data)).then((res) => {
        if (res.message === "Report successfully created") {
          notify("Report Created Successfully");
          setLoading(false);
          // Store report data for PDF generation
          setReportData(data);
          setReportValue(InitData);
          setmedicines([]);
        } else {
          setLoading(false);
          notify("Something went Wrong");
        }
      });
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  if (data?.isAuthticated === false) {
    return <Navigate to={"/"} />;
  }

  if (data?.user.userType !== "doctor") {
    return <Navigate to={"/dashboard"} />;
  }
  
  return (
    <>
      <style>{styles}</style>
      <ToastContainer />
      <div className="container">
        <Sidebar />
        <div className="AfterSideBar">
          <div className="Main_Add_Doctor_div">
            <h1>Create Report</h1>
            <form ref={formRef}>
              <div>
                <label>Doctor Name</label>
                <div className="inputdiv">
                  <input
                    type="text"
                    placeholder="Full Name"
                    name="docName"
                    value={ReportValue.docName}
                    onChange={HandleReportChange}
                    required
                  />
                </div>
              </div>
              <div>
                <label>Department</label>
                <div className="inputdiv">
                  <input
                    type="text"
                    placeholder="Department"
                    name="docDepartment"
                    value={ReportValue.docDepartment}
                    onChange={HandleReportChange}
                    required
                  />
                </div>
              </div>
              <div>
                <label>Doctor Mobile</label>
                <div className="inputdiv">
                  <input
                    type="number"
                    placeholder="No"
                    name="docMobile"
                    value={ReportValue.docMobile}
                    onChange={HandleReportChange}
                  />
                </div>
              </div>
              <div>
                <label>Patient Name</label>
                <div className="inputdiv">
                  <input
                    type="text"
                    placeholder="Name"
                    name="patientName"
                    value={ReportValue.patientName}
                    onChange={HandleReportChange}
                    required
                  />
                </div>
              </div>
              <div>
                <label>Patient Age</label>
                <div className="inputdiv">
                  <input
                    type="number"
                    placeholder="Age"
                    name="patientAge"
                    value={ReportValue.patientAge}
                    onChange={HandleReportChange}
                    required
                  />
                </div>
              </div>
              <div>
                <label>Patient Mobile</label>
                <div className="inputdiv">
                  <input
                    type="number"
                    placeholder="Mobile"
                    name="patientMobile"
                    value={ReportValue.patientMobile}
                    onChange={HandleReportChange}
                    required
                  />
                </div>
              </div>
              <div>
                <label>Email</label>
                <div className="inputdiv">
                  <input
                    type="email"
                    placeholder="abc@abc"
                    name="email"
                    value={ReportValue.email}
                    onChange={HandleReportChange}
                    required
                  />
                </div>
              </div>
              <div>
                <label>Patient Gender</label>
                <div className="inputdiv">
                  <select
                    name="patientGender"
                    value={ReportValue.patientGender}
                    onChange={HandleReportChange}
                  >
                    <option value="Choose Gender">Choose Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>
              <div>
                <label>Patient Blood Group</label>
                <div className="inputdiv">
                  <select
                    name="patientBloodGroup"
                    value={ReportValue.patientBloodGroup}
                    onChange={HandleReportChange}
                    required
                  >
                    <option value="Choose Blood Group">Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
              <div>
                <label>Patient Disease</label>
                <div className="inputdiv">
                  <input
                    type="text"
                    placeholder="Disease"
                    name="patientDisease"
                    value={ReportValue.patientDisease}
                    onChange={HandleReportChange}
                    required
                  />
                </div>
              </div>
              <div>
                <label>Patient Temperature</label>
                <div className="inputdiv">
                  <input
                    type="number"
                    placeholder="99^C"
                    name="patientTemperature"
                    value={ReportValue.patientTemperature}
                    onChange={HandleReportChange}
                  />
                </div>
              </div>

              <div>
                <label>Patient Weight</label>
                <div className="inputdiv">
                  <input
                    type="number"
                    placeholder="75 KG"
                    name="patientWeight"
                    value={ReportValue.patientWeight}
                    onChange={HandleReportChange}
                  />
                </div>
              </div>
              <div>
                <label>Patient BP</label>
                <div className="inputdiv adressdiv">
                  <input
                    type="textZZ"
                    placeholder="140/90 mmHg"
                    name="patientBP"
                    value={ReportValue.patientBP}
                    onChange={HandleReportChange}
                  />
                </div>
              </div>
              <div>
                <label>Patient Glucose</label>
                <div className="inputdiv">
                  <input
                    type="number"
                    placeholder="99 mg/dL"
                    name="patientGlucose"
                    value={ReportValue.patientGlucose}
                    onChange={HandleReportChange}
                  />
                </div>
              </div>
              <div>
                <label>Extra Info</label>
                <div className="inputdiv">
                  <input
                    type="text"
                    placeholder="Info"
                    name="extrainfo"
                    value={ReportValue.extrainfo}
                    onChange={HandleReportChange}
                  />
                </div>
              </div>
              {/* ******************************************** */}
              <div>
                <label>Medicines</label>
                <div className="inputdiv">
                  <input
                    type="text"
                    placeholder="PCM"
                    name="medName"
                    value={med.medName}
                    onChange={HandleMedChange}
                  />
                  <select name="duration" value={med.duration} onChange={HandleMedChange}>
                    <option value="Dosage">Duration</option>
                    <option value="After Meal">After Meal</option>
                    <option value="Before Meal">Before Meal</option>
                  </select>
                  <select name="dosage" value={med.dosage} onChange={HandleMedChange}>
                    <option value="Dosage">Dosage</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                  <input type="submit" value={"Add"} onClick={HandleMedAdd} />
                </div>
              </div>
              {/* Added Medicines List */}
              {medicines.length > 0 && (
                <div className="medicines-list">
                  <h3>Added Medicines</h3>
                  <table className="medicines-table">
                    <thead>
                      <tr>
                        <th>Medicine</th>
                        <th>Duration</th>
                        <th>Dosage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicines.map((med, index) => (
                        <tr key={index}>
                          <td>{med.medName}</td>
                          <td>{med.duration}</td>
                          <td>{med.dosage}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {/* *********************************** */}
              <div>
                <label>Date</label>
                <div className="inputdiv">
                  <input
                    type="date"
                    placeholder="dd-mm-yyyy"
                    name="date"
                    value={ReportValue.date}
                    onChange={HandleReportChange}
                  />
                </div>
              </div>
              <div>
                <label>Time</label>
                <div className="inputdiv">
                  <input
                    type="time"
                    name="time"
                    value={ReportValue.time}
                    onChange={HandleReportChange}
                  />
                </div>
              </div>

              <div className="report-buttons">
                <button
                  className="formsubmitbutton bookingbutton"
                  onClick={HandleReportSubmit}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Generate Report"}
                </button>
                
                {reportData && (
                  <button
                    type="button"
                    className="formsubmitbutton pdf-button"
                    onClick={generatePDF}
                    disabled={pdfGenerating}
                  >
                    {pdfGenerating ? "Generating PDF..." : "Download as PDF"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Discharge_and_Create_Slip;