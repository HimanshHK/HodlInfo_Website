const express= require("express");
const app=express();
const path=require("path");
const bodyParser=require('body-parser');
const port=process.env.port || 3000;
const https=require("https");
const request = require('request');
const sqlite3 = require('sqlite3').verbose();

app.set('view engine','ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const db = new sqlite3.Database("./sqldata.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error(err.message)
})

app.use(express.static(path.join(__dirname, 'public')));

function stringToObject(JSONString) {
    var jsonObject = JSON.parse(JSONString);
    return jsonObject;
}

let datatb
let rows = []
datatb = 'CREATE TABLE hodlinfo(num int,name char[30], last char[30], buy char[30], sell char[30], volume char[30], base_unit char[30])'
db.run(datatb, (err) => {
    if (!err) {
        console.log("Successfully created table")
    }
})


app.get("/", (req, res)=>{
	let x=0;
    let url = "https://api.wazirx.com/api/v2/tickers";
    try{
        request.get(url,{},(err, resp, body)=>{
            if(err){
                console.log(err);
            }
            else{
                let jsonObject = JSON.parse(body);
				
				const array=["btcinr","xrpinr","ethinr","trxinr","eosinr","zilinr","batinr","zrxinr","reqinr","nulsinr"];
				array.forEach((element)=>{
			    x++;
				const name=jsonObject[element]['name'];
				const last=jsonObject[element]['last'];
				const buy= jsonObject[element]['buy'];
				const sell= jsonObject[element]['sell'];
				const volume=jsonObject[element]['volume'];
				const base_unit=jsonObject[element]['base_unit'];
				
                let datains = 'INSERT INTO hodlinfo(num,name, last, buy, sell, volume,base_unit) VALUES (?,?,?,?,?,?,?)'
                db.run(datains, [x,name,last,buy,sell,volume,base_unit], (err) => {
                if (err) return console.error(err.message)
				})
			    
			})
			
			  let data = `SELECT * FROM hodlinfo order by num`
              db.all(data, [], (err, rows) => {
              if (err) return console.error(err.message)
		      res.render('index', { rows: rows });
              })
               
			   
            }
        });
    }
    catch(err){
        console.log(err);
    }
	
});




app.listen(port,function(req,res){
    console.log("Server is running Successfully");
});