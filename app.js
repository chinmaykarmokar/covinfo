const mysql = require('mysql');
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const credentials = require('./src/modules');
const fs = require("fs");
const favicon = require('serve-favicon');
const json2csv = require('json2csv').parse;

const app = express();

// Serving Static Files
app.use(express.static(__dirname + '/public'));
app.use(favicon(__dirname + '/public/images/favicon.ico'));

// View engine setup
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// Using Body-Parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let connection = mysql.createConnection({
    host: credentials.host,
    user: credentials.user,
    password: credentials.password,
    database: credentials.database,
    tls: {
        rejectUnauthorized: false
    }
})

connection.connect((err) => {
    if (err) throw err;
})

let transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    auth: {
        user: credentials.email,
        pass: credentials.pass
    }
});

// GET Responses:

app.get('/', (req, res) => {
    res.render('home', {layout: false});
})

app.get('/create', (req, res) => {
    res.render('createHospital', { layout: false });
})

app.get('/insert', (req, res) => {
    res.render('insert', { layout: false });
})

app.get('/csv', (req, res) => {
    res.render('preview', { layout: false });
})

app.get('/update', (req, res) => {
    res.render('update', { layout: false });
})

app.get('/text', (req, res) => {
    res.render('text', { layout: false });
})

app.get('/showTable', (req,res) => {
    res.render('showTable', { layout:false });
})

// POST Responses

app.post('/tableCreated', (req, res) => {
    let create_table_name = req.body.table_name;
    let emailID = req.body.email;

    let create_table = "CREATE TABLE" + ' ' + create_table_name + ' ' + "(Number_Of_New_Covid19_Patients_Admiited_Today INT(10), Number_Of_Patients_Discharged_Today INT(10), Number_Of_Active_Patients INT(10), Number_Of_Deaths_Today INT(10), Number_Of_Patients_Critical INT(10), Number_Of_Beds_Available INT(10), Number_Of_ICU_Beds_Available INT(10), Number_Of_Remdesivir_Injections_In_Stock INT(10), Number_Of_Tocilizumab_Injections_In_Stock INT(10), Amount_Of_Oxygen_Left VARCHAR(255), Date TIMESTAMP, PRIMARY KEY (Date))";

    connection.query(create_table, (err) => {
        try {
            if (err) {
                res.render('error', { layout:false });
                console.log(err);
            }
            else {
                let mailOptions = {
                    from: credentials.email,
                    to: emailID,
                    subject: 'Covinfo: Your Table is ready!',
                    html: '<p>Thanks for using Covinfo, you have your first table!</p><b>Table Name: ' + create_table_name + `</b>
                    <p>Your table was created with default columns named Number_Of_New_Covid19_Patients_Admiited_Today, Number_Of_Patients_Discharged_Today, Number_Of_Patients_Critical, Number_Of_Beds_Available, Number_Of_ICU_Beds_Available, Number_Of_Remdesivir_Injections_In_Stock, Number_Of_Tocilizumab_Injections_In_Stock, Amount_Of_Oxygen_Left & Date.</p>
                    <p><b>Step 1: </b>You have already created your table.</p>
                    <p><b>Step 2: </b>You can now go to the <b>Feed Values</b> section to populate your table.</p>
                    <p><b>Step 3 (Optional): </b>Incase you have made any mistake while sending your data you can rectify them in the <b>Update Values' section.</b>
                    <p><b>Step 4: </b>You can see how your table looks like in the <b>See Preview Of your Table</b> section.</p>
                    <p><b>Step 5: </b>Download your data as CSV file from the <b>Generate CSV</b> section.</p>
                    <p><b>Step 6: </b>Download text and word file of your data from the <b>Generate Text or Word File</b> section.</p>
                    <p>Use these credentials for further use... Thank you!</p>`
                };
        
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
        
                res.render('tableCreated', {layout:false});
            }
        }

        catch (err) {
            console.log(err);
        }
    })
})

app.post('/inserted', (req, res) => {
    let name_of_table = req.body.table;
    let field1 = req.body.field1;
    let field2 = req.body.field2;
    let field3 = req.body.field3;
    let field4 = req.body.field4;
    let field5 = req.body.field5;
    let field6 = req.body.field6;
    let field7 = req.body.field7;
    let field8 = req.body.field8;
    let field9 = req.body.field9;
    let field10 = req.body.field10;
    let date = req.body.date;

    let sql = "SHOW COLUMNS FROM " + name_of_table;

    connection.query(sql, (err, rows, fields) => {
        try {
            if (err) {
                res.render('error', { layout: false });
            }
            else {
                let insert = "INSERT INTO" + ' ' + name_of_table + ' ' + "(" + rows[0].Field + "," + rows[1].Field + "," + rows[2].Field + "," + rows[3].Field + "," + rows[4].Field + "," + rows[5].Field + "," + rows[6].Field + "," + rows[7].Field + "," + rows[8].Field + "," + rows[9].Field + "," + rows[10].Field + ") VALUES ?"

                let from_form = [field1, field2, field3, field4, field5, field6, field7, field8, field9, field10, date];
                console.log(from_form);
                let values = [];
                let final_values = values.push(from_form);
                console.log(values);

                connection.query(insert, [values], (err) => {
                    try {
                        if (err) {
                            res.render('error', { layout: false });
                        }
                        else {
                            res.render('valueInserted', {layout: false});
                        }
                    }

                    catch (err) {
                        console.log(err);
                    }
                })       
            }
        }

        catch (err) {
            console.log(err);
        }
    })
})

let file = [];

app.post('/preview', (req, res) => {
    let name_of_table = req.body.table;
    file.push(req.body.file);
    console.log(name_of_table);
    console.log(file);
    let email_add = req.body.email;

    let select = "SELECT * FROM " + name_of_table;

    connection.query(select, (err, result, fields) => {
        try {
            if (err) {
                res.render('error', { layout:false });
                console.log(err);
            }
            else {
                const csvString = json2csv(result);
                res.setHeader('Content-disposition', 'attachment; filename=' + file[file.length - 1] + '.csv');
                res.set('Content-Type', 'text/csv');
                res.status(200).send(csvString); 
            }
        }
    
        catch (err) {
            console.log(err);
        }
    })
})

app.post('/updated', (req, res) => {
    let tableName = req.body.table;
    let column = req.body.col;
    let date = req.body.date;
    let newVal = req.body.newVal;

    let update_query = "UPDATE " + tableName + " SET " + column + " =" + "'" + newVal + "'" + " WHERE Date = " + "'" + date + "'";

    connection.query(update_query, (err, result) => {
        try {
            if (err) {
                res.render('error', { layout:false });
                console.log(err);
            }
            else {
                res.render('updated', {layout:false});
            }
        }
    
        catch (err) {
            console.log(err);
        }
    })
})

app.post('/yourdata', (req, res) => {
    let nameOfTable = req.body.name;
    let date = req.body.date;
    let fileName = req.body.file;
    file.push(fileName);

    let showQuery = "SELECT * FROM " + nameOfTable + " WHERE Date = " + "'" + date + "'";
    console.log(showQuery);

    connection.query(showQuery, (err, result, fields) => {

        try {
            if (err) {
                res.render('error', { layout:false });
                console.log(err);
            }
            else {
                let textToSend = 
                `DAILY COVID-19 REPORT FROM ` + nameOfTable + ` FOR: ` + date + `\n` +
                ` ` + `\n` +
                `Number of New Patients admitted today: ` + Object.values(result[0])[0] + `\n` +
                `Number Of Patients Discharged Today: ` + Object.values(result[0])[1] + `\n` +
                `Number Of Active Patients: ` + Object.values(result[0])[2] + `\n` +
                `Number Of Deaths Today: ` + Object.values(result[0])[3] + `\n` +
                `Number Of Patients Critical: ` + Object.values(result[0])[4] + `\n` +
                `Number Of Beds Avaialble: ` + Object.values(result[0])[5] + `\n` +
                `Number Of ICU Beds Available: ` + Object.values(result[0])[6] + `\n` +
                `Number Of Remdesivir Injections In Stock: ` + Object.values(result[0])[7] + `\n` +
                `Number Of Tocilizumab Injections In Stock: ` + Object.values(result[0])[8] + `\n` +
                `Amount Of Oxygen Left: ` + Object.values(result[0])[9];

                res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
                res.set('Content-Type', 'text/csv');
                res.status(200).send(textToSend);
            }
        }

        catch (err) {
            console.log(err);
        }          

    })
})

app.post('/seeTable', (req,res) => {
    let table = req.body.tablename;

    let tableQuery = "SELECT * FROM " + table;

    connection.query(tableQuery, (err,result,fields) => {
        
        try {
            if (err) {
                res.render('error', { layout:false });
                console.log(err);
            }
            else {
                res.render('seeTable', { 
                    layout:false,
                    col1: fields[0].name,
                    col2: fields[1].name,
                    col3: fields[2].name,
                    col4: fields[3].name,
                    col5: fields[4].name,
                    col6: fields[5].name,
                    col7: fields[6].name,
                    col8: fields[7].name,
                    col9: fields[8].name,
                    col10: fields[9].name,
                    col11: fields[10].name,
                    result: result
                })
            }
        }

        catch (err) {
            console.log(err);
        }  
    })
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
})