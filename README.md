# NuclearImage's project for SSE

## Run it
1) Install node.js and XAMPP (any other SQL-database might work as well). Be sure to put a tick during installation on something with Microsoft/C++ whatever, otherwise the website won't start
2) Run MySQL service in XAMPP
3) Import the .sql file in phpMyAdmin (in XAMPP)
4) Run `npm install` in root folder
5) Put dbConfig.js into the root folder. Adjust your database settings. https://pastebin.com/raw/9Pb5xRQg
6) Run `node index.js`
