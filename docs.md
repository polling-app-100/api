# API documentation 

### POST DELETE & EDIT requests use JSON

## __Auth__

-----

### 1) Signup 
   > endpoint : **/auth/signup**  
   > method : POST

required data : 
`    
{  
    "username",
    "password",  
    "region",  
    "ageGroup"  
}
`
#### Options for region and ageGroup

*region* : `asia, africa, south america, north america, oceania, europe`

*ageGroup* : `children, youth, adults, seniors`

result :
`
{ "message" : "user succesfully registered }
`  

-> user created and stored in DB  
-> cookie dispatched with JWT containing user ID

-----

### 2)  Login
> endpoint : **/auth/login**   
> method: POST  
> 
required data:  
` 
{   
    "username",   
    "password"   
}
`

result :
`
{ "message" : "you have been succesfully logged in"  }
`

-> cookie dispatched containing JWT encoded user ID

-----

### 3) Logout

required data: none

result :   
-> makes cookie expire immediately

-----


## Poll

> Universal Endpoint: **/api/poll** 

-----

### 1) Create Poll
> method: POST

required data: 
`
{
    "title: String, "options" : [{ "title" : "string" }]
}
`

result : 
`
{ "message": "Poll Created" , *Created Poll Document }
`

-> new poll will be registered in DB  
-> author will be recognized using cookie sent from login or signup   
-> doesn't work if not logged in

-----

### 2) Edit Poll
> method: PUT

required data: `{ "_id" : String, "title" : String, "options" : [ {"title": String} ] }`

result : `{ "message" : "updated poll" }`

-> can change title or options of a poll  
-> only works when logged in and when user is creator of poll

-----

### 3) Delete Poll 
> method: DELETE

required data: `{ "_id" : String,  }`

result : `{ "message" : "poll deleted" }`

-> poll with that ID will be deleted from DB  
-> only works when logged in and when user is creator of poll

-----

### 4) Get All Polls
> method: GET

required data : none

result: `[{ polls }]`

-> retrieves all polls in DB

-----

### 5) Search One Poll
> method: GET  
> endpoint /api/poll/:_id

required data: none

result: `{ poll }`

-> retrives one poll based on poll ID
