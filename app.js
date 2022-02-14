const { Client } = require('pg');
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

let connection = new Client({
    host: credentials.host,
    user: credentials.user,
    password: credentials.password,
    database: credentials.database,
    ssl: {
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

    let create_table = "CREATE TABLE" + ' ' +  create_table_name + ' ' + "(number_of_new_covid19_patients_admiited_today INT, number_of_patients_discharged_today INT, number_of_active_patients INT, number_of_deaths_today INT, number_of_patients_critical INT, number_of_beds_available INT, number_of_icu_beds_available INT, number_of_remdesivir_injections_in_stock INT, number_of_tocilizumab_injections_in_stock INT, amount_of_oxygen_left VARCHAR, date DATE, PRIMARY KEY (Date))";
    console.log(create_table);
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
                    html: '<p>Thanks for using Covinfo, you have your first table!</p><b>Table Name: ' + create_table_name.toLowerCase() + `</b>
                    <p>Your table was created with default columns named number_of_new_covid19_patients_admiited_today, number_of_patients_discharged_today, number_of_patients_critical, number_of_beds_available, number_of_icu_beds_available, number_of_remdesivir_injections_in_stock, number_of_tocilizumab_injections_in_stock, amount_of_oxygen_left & date.</p>
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

    // let sql = "SHOW COLUMNS FROM " + name_of_table + ";";
    let sql = "SELECT column_name FROM information_schema.columns WHERE table_name = " + "'" + name_of_table + "'" + ";"
    console.log(sql);

    connection.query(sql, (err, rows, fields) => {
        try {
            if (err) {
                res.render('error', { layout: false });
                console.log(err);
            }
            else {
                console.log(rows.rows);
                console.log(rows.rows[0].column_name);
                    let insert = "INSERT INTO" + ' ' + name_of_table + ' ' + "(" + rows.rows[0].column_name + "," + rows.rows[1].column_name + "," + rows.rows[2].column_name + "," + rows.rows[3].column_name + "," + rows.rows[4].column_name + "," + rows.rows[5].column_name + "," + rows.rows[6].column_name + "," + rows.rows[7].column_name + "," + rows.rows[8].column_name + "," + rows.rows[9].column_name + "," + rows.rows[10].column_name + ") VALUES (" + field1 + ", " + field2 + ", " + field3 + ", " + field4 + ", " + field5 + ", " + field6 + ", " + field7 + ", " + field8 + ", " + field9 + ", '" + field10 + "', '" + date + "');";
                    console.log(insert);
                    let from_form = [field1, field2, field3, field4, field5, field6, field7, field8, field9, field10, date];
                    console.log(from_form);
                    let values = [];
                    let final_values = values.push(from_form);
                    console.log(values);

                    connection.query(insert, (err) => {
                        try {
                            if (err) {
                                res.render('error', { layout: false });
                                console.log(err);
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
    console.log(select);

    connection.query(select, (err, result, fields) => {
        try {
            if (err) {
                res.render('error', { layout:false });
                console.log(err);
            }
            else {
                console.log(result.rows);
                const csvString = json2csv(result.rows);
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
    console.log(update_query);

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
                console.log(result.rows[0].number_of_new_covid19_patients_admiited_today);
                let textToSend = 
                `DAILY COVID-19 REPORT FROM ` + nameOfTable + ` FOR: ` + date + `\n` +
                ` ` + `\n` +
                `Number of New Patients admitted today: ` + result.rows[0].number_of_new_covid19_patients_admiited_today + `\n` +
                `Number Of Patients Discharged Today: ` + result.rows[0].number_of_patients_discharged_today + `\n` +
                `Number Of Active Patients: ` + result.rows[0].number_of_active_patients + `\n` +
                `Number Of Deaths Today: ` + result.rows[0].number_of_deaths_today + `\n` +
                `Number Of Patients Critical: ` + result.rows[0].number_of_patients_critical + `\n` +
                `Number Of Beds Avaialble: ` + result.rows[0].number_of_beds_available + `\n` +
                `Number Of ICU Beds Available: ` + result.rows[0].number_of_icu_beds_available + `\n` +
                `Number Of Remdesivir Injections In Stock: ` + result.rows[0].number_of_remdesivir_injections_in_stock + `\n` +
                `Number Of Tocilizumab Injections In Stock: ` + result.rows[0].number_of_tocilizumab_injections_in_stock + `\n` +
                `Amount Of Oxygen Left: ` + result.rows[0].amount_of_oxygen_left;

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

    let tableQuery = "SELECT * FROM " + table + ";";
    console.log(tableQuery);

    connection.query(tableQuery, (err,result,fields) => {
        
        try {
            if (err) {
                res.render('error', { layout:false });
                console.log(err);
            }
            else {
                res.render('seeTable', { 
                    layout:false,
                    col1: result.fields[0].name,
                    col2: result.fields[1].name,
                    col3: result.fields[2].name,
                    col4: result.fields[3].name,
                    col5: result.fields[4].name,
                    col6: result.fields[5].name,
                    col7: result.fields[6].name,
                    col8: result.fields[7].name,
                    col9: result.fields[8].name,
                    col10: result.fields[9].name,
                    col11: result.fields[10].name,
                    result: result.rows
                })
                console.log(result.rows);
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