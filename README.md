# Polling App 100 Api

## Usage
- Authentication 🔐
  > - *Passwords* will be hashed and  store in the DB 🔑
  > - set *cookies* to persist user sessions and execute validation 🔒
  > - cookies stores user data that will be crucial to operate the app 🍪
  - login
  - logout
  - sign up

- Polling Function 📈 
  > Created Polls will be saved in user objects so that users can review their own posts
  - Create Polls
  - Edit Polls
  - Delete Polls  
  - View Polls

- Voting System 🗳
  > uses websockets to enable real time transfer and updating of data 🔌
  - vote 
  - cancle vote
  - broadcast vote and vote results to other clients

## Tech Stack 
[![TypeScript](https://badges.frapsoft.com/typescript/love/typescript-125x28.png?v=101)](https://github.com/ellerbrock/typescript-badges/)

Server : Express, MongoDB ( Mongoose ), socket .io

Auth : JsonWebToken, Bcrypt