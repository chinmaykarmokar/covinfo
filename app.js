const mysql = require('mysql');
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const credentials = require('./src/modules');
const fs = require("fs");
const json2csv = require('json2csv').parse;
const http = require('http');

const app = express();

// View engine setup
app.engine('handlebars', exphbs());
app.set('view engine','handlebars');

// Using Body-Parser middleware
app.use(bodyParser.urlencoded({extended: false}));
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

app.get('/', (req,res) => {
    res.send('Welcome to Resultly...!');
})

app.get('/createHospital', (req,res) => {
    res.render('createHospital', {layout:false});
})

app.get('/modifyHospital', (req,res) => {
    res.render('modifyhospital', {layout: false});
})

app.get('/insert', (req,res) => {
    res.render('insert', {layout: false});
})

app.get('/show', (req,res) => {
    res.render('preview', {layout: false});
})

app.get('/update', (req,res) => {
    res.render('update', {layout: false});
})

app.get('/text', (req,res) => {
    res.render('text', {layout:false});
})

// POST Responses

app.post('/tableCreated', (req,res) => {
    let create_table_name = req.body.table_name;
    let emailID = req.body.email;

    // let create_table = "CREATE TABLE" + ' ' + create_table_name + ' ' + "(Student_Name VARCHAR(255), Roll_No VARCHAR(255), Subject1 INT(10), Subject2 INT(10), Subject3 INT(10), Subject4 INT(10), Subject5 INT(10), PRIMARY KEY (Roll_No))";
    // let create_table = "CREATE TABLE" + ' ' + create_table_name + ' ' + "Number_Of_New_Covid-19_Patients_Admiited_Today INT(10), Number_Of_Patients_Discharged_Today INT(10), Number_Of_Patients_Critical INT(10), Number_Of_Beds_Available INT(10), Number_Of_ICU_Beds_Available INT(10), Number_Of_Remdesivir_Injections_In_Stock INT(10), Number_Of_Tocilizumab_Injections_In_Stock, Amount_Of_Oxygen_Left VARCHAR(255), Date DATE" + col_1 + " INT(10), " +  col_2 + " INT(10), " + col_3 + " INT(10), " + col_4 + " INT(10), " + col_5 + " INT(10), PRIMARY KEY (Roll_No))";
    let create_table = "CREATE TABLE" + ' ' + create_table_name + ' ' + "(Number_Of_New_Covid19_Patients_Admiited_Today INT(10), Number_Of_Patients_Discharged_Today INT(10), Number_Of_Patients_Critical INT(10), Number_Of_Beds_Available INT(10), Number_Of_ICU_Beds_Available INT(10), Number_Of_Remdesivir_Injections_In_Stock INT(10), Number_Of_Tocilizumab_Injections_In_Stock INT(10), Amount_Of_Oxygen_Left VARCHAR(255), Date DATE)";
    
    connection.query(create_table,(err) => {
        if (err) throw err;

        let mailOptions = {
            from: credentials.email,
            to: emailID,
            subject: 'Covinfo: Your Table is ready!',
            html: '<p>Thanks for using Reportly, you have your first table!</p><b>Table Name: ' + create_table_name + `</b>
            <p>Your table was created with default columns named Number_Of_New_Covid19_Patients_Admiited_Today, Number_Of_Patients_Discharged_Today, Number_Of_Patients_Critical, Number_Of_Beds_Available, Number_Of_ICU_Beds_Available, Number_Of_Remdesivir_Injections_In_Stock, Number_Of_Tocilizumab_Injections_In_Stock, Amount_Of_Oxygen_Left & Date.</p>
            <p>You can edit them as per your preferred column names later under "Modify Your Hospital Table" section...</p>
            <p>Use these credentials for further use... Thank you!</p>`
        };
          
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.send('Table for your Hospital created');    
    })
})

app.post('/modifiedCols', (req,res) => {
    let table_name = req.body.table;
    let new_column1 = req.body.col1;
    let new_column2 = req.body.col2;
    let new_column3 = req.body.col3;
    let new_column4 = req.body.col4;
    let new_column5 = req.body.col5;
    let new_column6 = req.body.col6;
    let new_column7 = req.body.col7;
    let new_column8 = req.body.col8;
    let emailID = req.body.email;

    let change_col_name = "ALTER TABLE" + ' ' + table_name + ' ' + "CHANGE Number_Of_New_Covid19_Patients_Admiited_Today" + ' ' + new_column1 + ' ' + "INT(10), CHANGE Number_Of_Patients_Discharged_Today" + ' ' + new_column2 + ' ' + "INT(10), CHANGE Number_Of_Patients_Critical" + ' ' + new_column3 + ' ' + "INT(10), CHANGE Number_Of_Beds_Available" + ' ' + new_column4 + ' ' + "INT(10), CHANGE Number_Of_ICU_Beds_Available" + ' ' + new_column5 + ' ' + "INT(10), CHANGE Number_Of_Remdesivir_Injections_In_Stock" + ' ' + new_column6 + ' ' + "INT(10), CHANGE Number_Of_Tocilizumab_Injections_In_Stock" + ' ' + new_column7 + ' ' + "INT(10), CHANGE Amount_Of_Oxygen_Left" + ' ' + new_column8 + ' ' + "INT(10)";

    connection.query(change_col_name, (err) => {
        let mailOptions = {
            from: credentials.email,
            to: emailID,
            subject: 'Covinfo: You have updated your columns!',
            html: '<p>Thanks for using Covinfo, these are the columns that you have updated;</p><b>Table Name: ' + table_name + `</b>
            <p>` + new_column1 + ', ' + new_column2 + ', ' + new_column3 + ', ' + new_column4 + ', ' + new_column5 + `</p>
            <p>You will require to use these column values now for feeding values into your table later.</p>
            <p>Thank You!</p>`
        };
          
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        try {
            if (err) {
                throw err;
            }
            else {
                res.send('No errors found. Column name has been changed');
            }
        }

        catch (err) {
            console.log(err);
        }  
    })
}) 

app.post('/inserted', (req,res) => {
    let name_of_table = req.body.table;
    let field1 = req.body.field1;
    let field2 = req.body.field2;
    let field3 = req.body.field3;
    let field4 = req.body.field4;
    let field5 = req.body.field5;
    let field6 = req.body.field6;
    let field7 = req.body.field7;
    let field8 = req.body.field8;

    let sql = "SHOW COLUMNS FROM " + name_of_table;

    connection.query(sql, (err, rows, fields) => {
        if (err) throw err;

        let insert = "INSERT INTO" + ' ' + name_of_table + ' ' + "(" + rows[0].Field + "," + rows[1].Field + "," + rows[2].Field + "," + rows[3].Field + "," + rows[4].Field + "," + rows[5].Field + "," + rows[6].Field + "," + rows[7].Field + ") VALUES ?"

        let from_form = [field1,field2,field3,field4,field5,field6,field7,field8];
        console.log(from_form);
        let values = [];
        let final_values = values.push(from_form);
        console.log(values);

        connection.query(insert, [values], (err) => {
            try {
                if (err) {
                    res.send(err);
                    console.log(err);
                }
                else {
                    res.send('No errors found. Values inserted');
                }
            }
    
            catch (err) {
                console.log(err);
            }  
        })
    })
})

let file = [];

app.post('/preview', (req,res) => {
    let name_of_table = req.body.table;
    file.push(req.body.file);
    console.log(name_of_table);
    console.log(file);
    let email_add = req.body.email;
    
    let select = "SELECT * FROM " + name_of_table;

    connection.query(select, (err,result,fields) => {
        const csvString = json2csv(result);
        res.setHeader('Content-disposition', 'attachment; filename=' + file[file.length - 1] + '.csv');
        res.set('Content-Type', 'text/csv');
        res.status(200).send(csvString);
    })
})

app.post('/updated', (req,res) => {
    let tableName = req.body.table;
    let column = req.body.col;
    let roll = req.body.roll;
    let newVal = req.body.newVal;

    let update_query = "UPDATE " + tableName + " SET " + column + " =" + "'" + newVal + "'" + " WHERE Roll_No = " + "'" + roll + "'";

    connection.query(update_query, (err,result) => {
        if (err) throw err;

        res.send('Values provided by you have been updated by the values provided by you...')
    })
})

app.post('/yourdata', (req,res) => {
    let nameOfTable = req.body.name;
    let nameOfPatient = req.body.date;

    let showQuery = "SELECT * FROM dummyHospital";

    connection.query(showQuery, (err,result,fields) => {
        if (err) throw err;

        //Object.keys(result[0])[0];
        //res.send(Object.keys(result[0])[0]);

        //let newArray = result.map(x => Object.values(x)[0]);
        //res.send(newArray);

        let textToSend = `The Number of Beds available is:` + Object.values(result[0])[0];

        res.setHeader('Content-disposition', 'attachment; filename=text.txt');
        res.set('Content-Type', 'text/csv');
        res.status(200).send(textToSend);
    
    })
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
})