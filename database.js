const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

connection.connect((err) => {
    if (err) {
        console.error("❌ Database not connected:", err.message);
    } else {
        console.log("✅ Database connected successfully");
    }
});

module.exports = connection;






































// const mysql=require("mysql2");

// const connection=mysql.createConnection({
//     host:"localhost",
//     user:"root",
//     password:"",
//     database:"Devi"
// });

// connection.connect((err)=>{
//     if(err){
//         console.error("database not connect bro.....");
//     }
//     else{
//         console.info("database connected successfully .....");
//     }
// })

// module.exports=connection;