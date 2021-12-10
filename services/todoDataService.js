// Calling .config() will allow dotenv to pull environment variables from our .env file...
require('dotenv').config();
// ...made available from process.env
const TableName = process.env.TABLE_NAME;
// You'll need to call dynamoClient methods to envoke CRUD operations on the DynamoDB table
const dynamoClient = require('../db');
// uuid, useful for generating unique ids
const uuid = require("uuid");

module.exports = class TodoDataService {
  static async addTodo(todo) {
    const id = uuid.v4();
    todo.id = id;

    const params = {
      TableName, // "tododata"
    };

    try {
      // Check the "tododata" table for existing a tododata item
      let existingTodoData = await dynamoClient.scan(params).promise().then((data) => {
        return data;
      });
      
      // no tododata exists yet
      if (existingTodoData.Items.length === 0) {
        const newTodoData = {
          order: [],
          todos: {}
        };
        newTodoData.id = "0";
        newTodoData.order.push(id);
        newTodoData.todos[id] = todo;
        
        // Add a new tododata placeholder item to the "tododata" table
        const params = {
          TableName,
          Item: newTodoData,
        }
    
        await dynamoClient.put(params)
        .promise()
        .then((data) => {
           console.log(data);
         })
        .catch((err) => {
           console.log(err);
         });

        // Return the newly created tododata item
         let newItem = await this.getTodos();

         return newItem;

        } else { // a tododata item already exist
        existingTodoData = existingTodoData.Items[0];
        existingTodoData.order.push(id);
        existingTodoData.todos[id] = todo;
        
        // Replace the existing tododata item with the new one, created in the above three lines
        const params = {
          TableName,
          Item: existingTodoData,
        }

        await dynamoClient.put(params)
        .promise()
        .then((data) => {
           console.log(data);
         })
        .catch((err) => {
           console.log(err);
         });
        let newItem = await this.getTodos();
        console.log(newItem)
        return newItem;
        
        // Return the newly created tododata item
      }
    } catch (error) {
      console.error(error);
      return error;
    }
   
  }

  static async getTodos() {
    try {
      const params = {
        TableName,
        Key: {
          id: "0"
        }
      }
    
      return dynamoClient.get(params)
      .promise()
      .then((data) => {
         console.log(data);
         return data.Item;
       })
      .catch((err) => {
         console.log(err);
       });

      // Check the "tododata" table for the tododata item, and return it
    } catch (error) {
      console.error(error);
      return error;
    }
    
  }

  static async updateOrder(options) {
    try {
      const params = {
        TableName,
        Key: {
          id: "0"
        },
        UpdateExpression: 'set #updatedOrder = :newOrder',
        ExpressionAttributeNames: {
          '#updatedOrder' : "order"
        },
        ExpressionAttributeValues: {
          ":newOrder": options.order
        }

      }
      await dynamoClient.update(params).promise()
      return this.getTodos
      // Update the tododata item
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  static async updateTodo(id, options) {
    try {
      let params = {
        TableName,
        Key: {
          id: id
        },
      }

      // Check the "tododata" table for the tododata item, and set it to "existingTodo"
      // let existingTodo = ...

      let existingTodo = await dynamoClient.scan(params).promise().then((data) => {
        console.log(data.Items[0])
        return data.Items[0];
      });
      
      for (let key in options) {
        existingTodo.todos[id][key] = options[key];
      }

      params = {
        TableName,
        Item: {
          ...existingTodo
        },
        UpdateExpression: 'set name = :name, dateCompleted = :dateCompleted',
        ExpressionAttributeValues: {
          ":name": options.name,
          ":dateCompleted" : options.dateCompleted
        }
      }
      await dynamoClient.update(params).promise()
      // Replace the existing tododata item with the updated one

    } catch (error) {
      console.error(error);
      return error;
    }
  }

  static async deleteTodo(id) {
    try {
      let params = {
        TableName,
        Key: {
          id: "0"
        }
      }

      // Check the "tododata" table for the tododata item, and set it to "existingTodo"
      // let existingTodo = ...

      existingTodo.order = existingTodo.order.filter((orderId) => {
        return orderId !== id
      });

      delete existingTodo.todos[id];

      params = {
        TableName,
        Item: {
          ...existingTodo
        }
      }

      // Replace the existing tododata item with the updated one
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  static async deleteCompletedTodos() {
    try {
      let params = {
        TableName,
        Key: {
          id: "0"
        }
      }

      let existingTodo = await dynamoClient.scan(params).promise().then((data) => {
          return data.Items[0];
      });

      existingTodo.order = existingTodo.order.filter((orderId) => {
        return !existingTodo.todos[orderId].completed;
      });
      for (let id in existingTodo.todos) {
        if (existingTodo.todos[id].completed) {
          delete existingTodo.todos[id];
        }
      }
      
      params = {
        TableName,
        Item: {
          ...existingTodo
        }
      }

      await dynamoClient.put(params).promise();
    } catch (error) {
      console.error(error);
      return error;
    }
  }
};
