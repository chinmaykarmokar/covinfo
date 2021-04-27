const mysql = require('mysql');
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const credentials = require('./src/modules');
const fs = require("fs");
const json2csv = require('json2csv').parse;

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

app.get('/create', (req,res) => {
    res.render('create_table', {layout:false});
})

app.get('/change', (req,res) => {
    res.render('change_cols', {layout: false});
})

app.get('/insert', (req,res) => {
    res.render('insert', {layout: false});
})

app.get('/show', (req,res) => {
    res.render('preview', {layout: false});
})

// POST Responses

app.post('/send', (req,res) => {
    let create_table_name = req.body.table_name;
    let emailID = req.body.email;

    let create_table = "CREATE TABLE" + ' ' + create_table_name + ' ' + "(Student_Name VARCHAR(255), Roll_No VARCHAR(255), Subject1 INT(10), Subject2 INT(10), Subject3 INT(10), Subject4 INT(10), Subject5 INT(10), PRIMARY KEY (Roll_No))";
    
    connection.query(create_table,(err) => {
        if (err) throw err;

        let mailOptions = {
            from: credentials.email,
            to: emailID,
            subject: 'Resultly: Your Table is ready!',
            html: '<p>Thanks for using Reportly, you have your first table!</p><h3>Table Name: ' + create_table_name + `</h3>
            <p>Your table was created with default columns named Student_Name, Roll_No, Subject1, Subject2, Subject3, Subject4, Subject5.</p>
            <p>You can edit them as per your preferred subject later...</p>
            <br>
            <p>Use these credentials for further use...</p>`
        };
          
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.send('Table created');    
    })
})

app.post('/response', (req,res) => {
    let table_name = req.body.table;
    let new_column1 = req.body.col1;
    let new_column2 = req.body.col2;
    let new_column3 = req.body.col3;
    let new_column4 = req.body.col4;
    let new_column5 = req.body.col5;
    let emailID = req.body.email;

    let change_col_name = "ALTER TABLE" + ' ' + table_name + ' ' + "CHANGE Subject1" + ' ' + new_column1 + ' ' + "INT(10), CHANGE Subject2" + ' ' + new_column2 + ' ' + "INT(10), CHANGE Subject3" + ' ' + new_column3 + ' ' + "INT(10), CHANGE Subject4" + ' ' + new_column4 + ' ' + "INT(10), CHANGE Subject5" + ' ' + new_column5 + ' ' + "INT(10)";

    connection.query(change_col_name, (err) => {
        let mailOptions = {
            from: credentials.email,
            to: emailID,
            subject: 'Resultly: You have updated your columns!!',
            html: '<p>Thanks for using Reportly, these are the columns that you have updaed;</p><h4>Table Name: ' + table_name + `</h4>
            <p>` + new_column1 + ', ' + new_column2 + ', ' + new_column3 + ', ' + new_column4 + ', ' + new_column5 + `</p>
            <p>You will require to use these column values for feeding values into your table later.</p>
            <br>
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
                throw 'No errors found. Column name has been changed';
            }
        }

        catch (err) {
            console.log(err);
        }  
    })
}) 

app.post('/inserted', (req,res) => {
    let name_of_table = req.body.table;
    let name = req.body.name;
    let rollNo = req.body.roll;
    let sub1 = req.body.sub2;
    let sub2 = req.body.sub2;
    let sub3 = req.body.sub3;
    let sub4 = req.body.sub4;
    let sub5 = req.body.sub5;

    let sql = "SHOW COLUMNS FROM " + name_of_table;

    connection.query(sql, (err, rows, fields) => {
        if (err) throw err;

        let insert = "INSERT INTO" + ' ' + name_of_table + ' ' + "(" + rows[0].Field + "," + rows[1].Field + "," + rows[2].Field + "," + rows[3].Field + "," + rows[4].Field + "," + rows[5].Field + "," + rows[6].Field + ") VALUES ?"

        let from_form = [name,rollNo,sub1,sub2,sub3,sub4,sub5];
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
        
        // json2csv({ data: result, fields: fields }, function(err, csv) {
        //     //res.setHeader('Content-disposition', 'attachment; filename=data.csv');
        //     res.setHeader('Content-disposition', 'attachment; filename=' + file[file.length - 1] + '.csv');
        //     res.set('Content-Type', 'text/csv');
        //     res.status(200).send(csv);
        // });
    })
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
})