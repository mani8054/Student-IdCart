require("dotenv").config();

const express = require("express");
const connection = require("./database");
const multer = require("multer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// Ensure upload folder exists
const uploadPath = path.join(__dirname, "public/photo");

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

// Home routes
app.get("/", (req, res) => res.render("home"));
app.get("/about", (req, res) => res.render("about"));

// Student form
app.get("/student", (req, res) => {
    res.render("student", { message: "" });
});

// Insert student
app.post("/fooo", upload.single("photo"), (req, res) => {
    const { name, classs, email } = req.body;

    const photo = req.file ? "/photo/" + req.file.filename : "";

    const q = "INSERT INTO student (name, classs, email, photo) VALUES (?, ?, ?, ?)";

    connection.query(q, [name, classs, email, photo], (err) => {
        if (err) {
            console.log("Insert Failed:", err);
            return res.send("Insert Failed!");
        }
        res.redirect("/student");
    });
});

// Show records
app.get("/record", (req, res) => {
    const q = "SELECT * FROM student";

    connection.query(q, (err, rows) => {
        if (err) {
            console.log(err);
            return res.send("Fetch Failed!");
        }
        res.render("record", { students: rows });
    });
});

// Delete student
app.get("/delete/:id", (req, res) => {
    const q = "DELETE FROM student WHERE id = ?";

    connection.query(q, [req.params.id], (err) => {
        if (err) {
            console.log(err);
            return res.send("Delete Failed!");
        }
        res.redirect("/record");
    });
});

// Download ID card PDF
app.get("/download/:id", (req, res) => {
    const q = "SELECT * FROM student WHERE id = ?";

    connection.query(q, [req.params.id], (err, rows) => {
        if (err || rows.length === 0) {
            return res.send("Student Not Found!");
        }

        const student = rows[0];
        const doc = new PDFDocument({ size: [300, 450] });

        res.setHeader("Content-Disposition", `attachment; filename=ID-${student.id}.pdf`);
        res.setHeader("Content-Type", "application/pdf");

        doc.pipe(res);

        // Background
        const bgPath = path.join(__dirname, "public", "images", "bggg.jpg");
        if (fs.existsSync(bgPath)) {
            doc.image(bgPath, 0, 0, { width: 300, height: 450 });
        }

        // Header
        doc.rect(0, 0, 300, 40).fill("#003cb3");
        doc.fillColor("white")
            .fontSize(15)
            .text("LAKSHMIDEVI UNIVERSITY", 0, 12, { align: "center" });

        // Logo
        const logoPath = path.join(__dirname, "public", "images", "logo.png");
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 10, 45, { width: 35, height: 35 });
        }

        // Student photo
        const photoFile = student.photo ? student.photo.replace(/^\//, "") : "";
        const photoPath = path.join(__dirname, "public", photoFile);

        doc.rect(95, 65, 110, 135).stroke();

        if (fs.existsSync(photoPath)) {
            doc.image(photoPath, 95, 65, { width: 110, height: 135 });
        } else {
            doc.fillColor("red").text("No Image", 120, 120);
        }

        // Details
        doc.fillColor("black").fontSize(12);
        doc.text(`ID        : ${student.id}`, 30, 220);
        doc.text(`Name      : ${student.name}`, 30, 250);
        doc.text(`Class     : ${student.classs}`, 30, 280);
        doc.text(`Email     : ${student.email}`, 30, 310);

        // Footer
        doc.rect(0, 410, 300, 40).fill("#003cb3");
        doc.fillColor("white")
            .fontSize(10)
            .text("Campus: Chennai, Tamil Nadu", 0, 425, { align: "center" });

        doc.end();
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


















































// const express = require("express");
// const connection = require("./database");
// const multer = require("multer");
// const PDFDocument = require("pdfkit");
// const fs = require("fs");
// const path = require("path");
// const app = express();
// const port = 3000;

// app.use(express.static("public"));
// app.set("view engine", "ejs");
// app.use(express.urlencoded({ extended: true }));

// //  Multer Setup for photo upload
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, "public/photo"),
//     filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
// });
// const upload = multer({ storage });

// // Home
// app.get("/", (req, res) => res.render("home"));


// app.get("/about", (req, res) => res.render("about"));

// // Student Form
// app.get("/student", (req, res) => res.render("student", { message: "" }));

// // Insert Student
// app.post("/fooo", upload.single("photo"), (req, res) => {
//     const { name, classs, email } = req.body;
//     const photo = "/photo/" + req.file.filename;

//     const q = "INSERT INTO student (name, classs, email, photo) VALUES (?, ?, ?, ?)";

//     connection.query(q, [name, classs, email, photo], (err, result) => {
//         if (err) {
//             console.log("Insert Failed:", err);
//             return res.send("Insert Failed!");
//         }
//         res.redirect("student");
//     });
// });


// //  Show Records
// app.get("/record", (req, res) => {
//     const q = "SELECT * FROM student";
//     connection.query(q, (err, rows) => {
//         if (err) return res.send("Fetch Failed!");
//         res.render("record", { students: rows });
//     });
// });

// //  Delete Student
// app.get("/delete/:id", (req, res) => {
//     const q = "DELETE FROM student WHERE id = ?";
//     connection.query(q, [req.params.id], (err) => {
//         if (err) return res.send("Delete Failed!");
//         res.redirect("/record");
//     });
// });

// //  Download ID Card PDF
// // const PDFDocument = require("pdfkit");
// // const fs = require("fs");
// // const path = require("path");

// app.get("/download/:id", (req, res) => {
//     const id = req.params.id;
//     const q = "SELECT * FROM student WHERE id = ?";

//     connection.query(q, [id], (err, rows) => {
//         if (err || rows.length === 0) return res.send("Student Not Found!");

//         const student = rows[0];
//         const doc = new PDFDocument({ size: [300, 450] });

//         res.setHeader('Content-Disposition', `attachment; filename=ID-${student.id}.pdf`);
//         res.setHeader('Content-Type', 'application/pdf');
//         doc.pipe(res);

//         // Background Image
//         const bgPath = path.join(__dirname, "public", "images", "bggg.jpg");
//         if (fs.existsSync(bgPath)) {
//             doc.image(bgPath, 0, 0, { width: 300, height: 450 });
//         }

//         // Top Banner
//         doc.rect(0, 0, 300, 40).fill("#003cb3");
//         doc.fillColor("white")
//            .fontSize(15)
//            .text("LAKSHMIDEVI UNIVERSITY", 0, 12, { align: "center" });

//         // Logo
//         const logoPath = path.join(__dirname, "public", "images", "logo.png");
//         if (fs.existsSync(logoPath)) {
//             doc.image(logoPath, 10, 45, { width: 35, height: 35 });
//         }

//         // Student Photo 
//         let photoFile = student.photo.replace(/^\//, "");
//         const photoPath = path.join(__dirname, "public", photoFile);

//         doc.rect(95, 65, 110, 135).stroke();
//         if (fs.existsSync(photoPath)) {
//             doc.image(photoPath, 95, 65, { width: 110, height: 135 });
//         } else {
//             doc.fillColor("red").text("No Image", 125, 120);
//         }

//         // Student Details (Correct & Clean Layout)
//         doc.fillColor("black").fontSize(12);
//         doc.text(`ID        : ${student.id}`, 30, 220);
//         doc.text(`Name      : ${student.name}`, 30, 250);
//         doc.text(`Class     : ${student.classs}`, 30, 280);
//         doc.text(`Email     : ${student.email}`, 30, 310);

//         //  Bottom Banner
//         doc.rect(0, 410, 300, 40).fill("#003cb3");
//         doc.fillColor("white")
//             .fontSize(10)
//             .text("Campus: Chennai, Tamil Nadu", 0, 425, { align: "center" });

//         doc.end();
//     });
// });
// app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
