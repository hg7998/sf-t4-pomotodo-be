const uuid = require("uuid");
const dynamoClient = require('../db');
const TableName = process.env.TABLE_NAME;


module.exports = class TodoDataService {
  static async addTodo(todo) {
    const id = uuid.v4();
    todo.id = id;

    const params = {
      TableName,
    };

    try {
      let existingTodoData = await dynamoClient.scan(params).promise();
      
      // no tododata exists yet
      if (existingTodoData.Items.length === 0) {
        const newTodoData = {
          order: [],
          todos: {}
        };
        newTodoData.id = "0";
        newTodoData.order.push(id);
        newTodoData.todos[id] = todo;

        const params = {
          TableName,
          Item: newTodoData,
        }

        await dynamoClient.put(params).promise();
        const newStoredTodoData = await dynamoClient.scan({ TableName }).promise();
        return newStoredTodoData.Items[0];
      } else { // todos exist
        existingTodoData = existingTodoData.Items[0];
        existingTodoData.order.push(id);
        existingTodoData.todos[id] = todo;
        
        const params = {
          TableName,
          Item: existingTodoData,
        }
        
        await dynamoClient.put(params).promise();
        const updatedTodoData = await dynamoClient.scan({ TableName }).promise();
        return updatedTodoData.Items[0];
      }
    } catch (error) {
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
      const response = await dynamoClient.scan(params).promise();
      return response.Items[0];
    } catch (error) {
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
        UpdateExpression: "set #oldOrder = :newOrder",
        ExpressionAttributeNames: {
          "#oldOrder": "order"
        },
        ExpressionAttributeValues: {
          ":newOrder": options.order
        },
      }

      await dynamoClient.update(params).promise();
    } catch (error) {
      return error;
    }
  }

  static async updateTodo(id, options) {
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

      for (let key in options) {
        existingTodo.todos[id][key] = options[key];
      }

      params = {
        TableName,
        Item: {
          ...existingTodo
        }
      }

      await dynamoClient.put(params).promise();
    } catch (error) {
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

      let existingTodo = await dynamoClient.scan(params).promise().then((data) => {
          return data.Items[0];
      });

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

      await dynamoClient.put(params).promise();
    } catch (error) {
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
      return error;
    }
  }
};
