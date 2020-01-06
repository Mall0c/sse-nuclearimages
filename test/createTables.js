const mysql_query = require('../mysql_query');

describe('Controller tests', () => {
    it('should create comment table', (done) => {
        mysql_query("CREATE TABLE `comments` (\
            `ID` int(11) NOT NULL AUTO_INCREMENT,\
            `Text` varchar(500) NOT NULL,\
            `Autor` int(11) NOT NULL,\
            `Image` int(11) NOT NULL,\
            `Deleted` tinyint(4) DEFAULT NULL,\
            PRIMARY KEY (`ID`)\
           ) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4", [], (err, result, fields) => {
            if(err) throw err;
            done();
        });
    });

    it('should create comment_ratings table', (done) => {
        mysql_query("CREATE TABLE `comments_ratings` (\
            `Comment_ID` int(11) NOT NULL,\
            `User_ID` int(11) NOT NULL,\
            `Rating_Value` int(11) DEFAULT NULL,\
            PRIMARY KEY (`Comment_ID`,`User_ID`)\
           ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", [], (err, result, fields) => {
            if(err) throw err;
            done();
        });
    });

    it('should create comment_reports table', (done) => {
        mysql_query("CREATE TABLE `comments_reports` (\
            `ID` int(11) NOT NULL AUTO_INCREMENT,\
            `CommentID` int(11) NOT NULL,\
            `UserID` int(11) NOT NULL,\
            `Text` varchar(300) NOT NULL,\
            PRIMARY KEY (`ID`)\
           ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", [], (err, result, fields) => {
            if(err) throw err;
            done();
        });
    });

    it('should create images table', (done) => {
        mysql_query("CREATE TABLE `images` (\
            `ID` int(11) NOT NULL AUTO_INCREMENT,\
            `Image` longtext NOT NULL,\
            `Upload_Time` bigint(20) NOT NULL,\
            `Uploader` int(11) NOT NULL,\
            `Tags` varchar(100) NOT NULL,\
            `Private` tinyint(4) NOT NULL,\
            `Anonymous` tinyint(4) NOT NULL,\
            `Deleted` tinyint(4) DEFAULT NULL,\
            PRIMARY KEY (`ID`)\
           ) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4", [], (err, result, fields) => {
            if(err) throw err;
            done();
        });
    });

    it('should create images_ratings table', (done) => {
        mysql_query("CREATE TABLE `images_ratings` (\
            `Image_ID` int(11) DEFAULT NULL,\
            `User_ID` int(11) DEFAULT NULL,\
            `Rating_Value` int(11) DEFAULT NULL\
           ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", [], (err, result, fields) => {
            if(err) throw err;
            done();
        });
    });

    it('should create images_reports table', (done) => {
        mysql_query("CREATE TABLE `images_reports` (\
            `ID` int(11) NOT NULL AUTO_INCREMENT,\
            `UserID` int(11) NOT NULL,\
            `ImageID` int(11) NOT NULL,\
            `Text` varchar(300) NOT NULL,\
            PRIMARY KEY (`ID`)\
           ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", [], (err, result, fields) => {
            if(err) throw err;
            done();
        });
    });

    it('should create user table', (done) => {
        mysql_query("CREATE TABLE `user` (\
            `ID` int(11) NOT NULL AUTO_INCREMENT,\
            `Username` varchar(15) NOT NULL,\
            `Password` varchar(100) NOT NULL,\
            `EMail` varchar(100) DEFAULT NULL,\
            `Deleted` tinyint(4) DEFAULT NULL,\
            `isAdmin` tinyint(4) DEFAULT NULL,\
            PRIMARY KEY (`ID`)\
           ) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4", [], (err, result, fields) => {
            if(err) throw err;
            done();
        });
    });
});