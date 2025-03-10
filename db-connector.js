const mysql = require ('mysql2');


// Create a connection pool using Tyler's credentials
const tylerPool = mysql.createPool({
  connectionLimit: 10,
  host: 'classmysql.engr.oregonstate.edu',
  user: 'cs340_nguyety4',                  
  password: '7034',                      
  database: 'cs340_nguyety4'                
}).promise();

// Create a connection pool using Nicholas's credentials
const nicholasPool = mysql.createPool({
  connectionLimit: 10,
  host: 'classmysql.engr.oregonstate.edu',  
  user: 'cs340_nguynich',           
  password: '2035',        
  database: 'cs340_nguynich'           
}).promise();

module.exports = {
  tylerPool: tylerPool,
  nicholasPool: nicholasPool
};
