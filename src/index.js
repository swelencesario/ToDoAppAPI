const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((users) => users.username === username);
    
    if(!user) {
        return response.status(400).json({ error: "User not found"});
    }

    request.user = user;

    return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(
    (user) => user.username === username
);

if( userAlreadyExists) {
    return response.status(400).json({ error: "User already exists"})
}   

  users.push({        
        id: uuidv4(),
        name,
        username,
        toDos: []
    });
    return response.status(201).send();  
});

app.get("/users", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.toDos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const userTodo = {
    id: uuidv4(),
    title,
    done: Boolean,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  user.toDos.push(userTodo);

  return response.status(201).send();
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;                   
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todo = user.toDos.find(todo => todo.id === id);

  todo.title = title;
  todo.deadline = new Date(deadline);
        
  return response.status(201).send();
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.toDos.find(todo => todo.id === id);

  todo.done = true;

  return response.status(201).send();


});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;

    users.splice(user, 1);

    return response.status(200).json(users);
});

module.exports = app;