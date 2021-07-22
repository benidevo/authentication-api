# Authentication API (Node.js)
A standalone JWT authentication API that can be used in any application. 

## Technologies 

The following technologies were used in this project:

- [JavaScript](https://www.javascript.com/)
- [JSON Web Tokens](https://jwt.io/)
- [Node.js](https://nodejs.org/en/)
- [Express.js](https://expressjs.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

## Requirements

Before starting, you need to have [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/) installed. Alternatively, you can download the code as a zip file.


## Clone this project

    git clone https://github.com/benidevo/authentication-api.git


## Install dependencies

    npm install

## Start server

    npm run server


# Endpoints

The endpoints and responses are described below.

## Register User

### Request

`POST api/auth/register`

    curl -i -H 'Accept: application/json' http://localhost:8080/api/auth/register

### Payload

    {
        "name": <string>,
        "email": <string>,
        "password": <string>
    }

### Response

    {
        "message": "Registration successful. Please activate your account",
        "error": false,
        "code": 201,
        "data": {
            "user": {
                "id": <string>,
                "name": <string>,
                "email": <string>,
                "isVerified": false,
                "createdAt": <string>
            },
            "verification": {
                "createdAt": <string>,
                "_id": <string>,
                "token": <string>,
                "userID": <string>,
                "type": "Register New Account",
                "__v": 0
            }
        }
    }


## Vwrify Token

### Request

`GET api/auth/verify/:token`

    curl -i -H 'Accept: application/json' http://localhost:8080/api/auth/verify/:token


### Response

    {
        "message": "verification successful",
        "error": false,
        "code": 200,
        "data": null
    }


## Login

### Request

`POST api/auth/login` 
    
    curl -i -H 'Accept: application/json' http://localhost:8080/api/auth/login

### Payload

    {
        "email": <string>,
        "password": <string>
    }

### Response

    {
        "message": "Successfully logged in",
        "error": false,
        "code": 200,
        "data": {
            "token": <string>
    }


## Resend Token

### Request

`POST api/auth/verify/resend`

    curl -i -H 'Accept: application/json' http://localhost:8080/api/auth/verify/resend

### Payload

    {
        "email": <string>
    }

### Response

    {
        "message": "Token resend successful",
        "error": false,
        "code": 200,
        "data": {
            "verification": {
                "createdAt": <string>,
                "_id": <string>,
                "token": <string>,
                "userID": <string>,
                "type": "Register New Account",
                "__v": 0
            }
        }
    }


## Get Authenticated User

### Request

`GET api/auth`

    curl -i -H 'Accept: application/json', 'Authorization: Bearer <token>' http://localhost:8080/api/auth/

### Response

    {
        "message": "Hello <user.name>",
        "error": false,
        "code": 200,
        "data": {
            "user": {
                "isVerified": true,
                "createdAt": <string>,
                "_id": <string>,
                "name": <string>,
                "email": <string>,
                "password": <string>,
                "__v": 0,
                "verifiedAt": <string>
            }
        }
    }


## Forgot Password

### Request

`POST api/password/forgot`

    curl -i -H 'Accept: application/json' http://localhost:8080/api/password/forgot

### Payload

    {
        "email": <string>
    }

### Response

    {
        "message": "Forgot password verification has been sent",
        "error": false,
        "code": 200,
        "data": {
            "newVerification": {
                "createdAt": <string>,
                "_id": <string>,
                "token": <string>,
                "userID": <string>,
                "type": "Forgot Password",
                "__v": 0
            }
        }
    }


## Reset Password

### Request

`POST api/password/reset`

    curl -i -H 'Accept: application/json' http://localhost:8080/api/password/reset

### Payload

    {
        "password": <string>,
        "token": <string>
    }

### Response

    {
        "message": "Password updated",
        "error": false,
        "code": 200,
        "data": null
    }
