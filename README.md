# NuclearImage's project for SSE

## Run it
1) Install node.js and XAMPP (any other SQL-database might work as well). Be sure to put a tick during node.js installation on something with Microsoft/C++ whatever, otherwise the website won't start.
2) Run MySQL service in XAMPP.
3) Import the .sql file in phpMyAdmin (in XAMPP).
4) Run `npm install` in root folder.
5) Put dbConfig.js into the root folder. Adjust your database settings. https://pastebin.com/raw/9Pb5xRQg
6) Create the directory "image_upload" in the root directory.
7) Run `node index.js`.

## Tests
The directory `tests` contains unit tests against the backend API. 
**Important**: don't simply run the tests as it could screw the database up. Before running the tests, do these steps:
1) Go to phpmyadmin and create an arbitrary database, e.g. `tests`.
2) Adjust it in dbConfig.js! This means that the database has to be changed for tests and dev. Thats a dirty workaround for now.
3) Run `npm test test/createTable.js` to have the tables inside `tests` created.
4) To run the tests, run for example `npm test test/userControllerTest.js`. The script will delete all records in the test database **before** the tests are run, meaning one can examine the database afterwards.
