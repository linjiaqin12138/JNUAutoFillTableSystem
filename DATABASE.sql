CREATE DATABASE JNUSTU DEFAULT SET utf8;
use JNUSTU
create table LoginData(
    user CHAR(10) PRIMARY KEY,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(20) NOT NULL
);
