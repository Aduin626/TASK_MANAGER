CREATE DATABASE task_manager;


CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

SELECT*FROM users;

INSERT INTO users (name,email,password) VALUES('Vitaliy','vit@gmail.com','12345');

CREATE TABLE task (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    deadline TIMESTAMP NOT NULL, 
    date_create TIMESTAMP NOT NULL,
    status BOOLEAN NOT NULL,
    user_id INTEGER NOT NULL, 
    FOREIGN KEY (user_id) REFERENCES users(id)
); 

