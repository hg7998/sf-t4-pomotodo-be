# Pomodoro Todo List (Pomotodo) Backend

## Requirements
- node (tested with versions 10+)
- AWS account with DynamoDB and IAM role with Programmatic Access
- Serverless Framework CLI

## Installation
- `npm install serverless` or `npm install -g serverless` (global local install)
- `npm install`

## Usage
- Create a DynamoDB table called "tododata" with a Primary Key: "tododata" as String
- Create a .env file with the following values
  ```
  PORT=5000
  TABLE_NAME=tododata
  AWS_ACCESS_KEY_ID=******************
  AWS_SECRET_ACCESS_KEY=****************
  AWS_DEFAULT_REGION=****************
  ```
- `npm start` to start the server
- `serverless deploy` to deploy the Lambda wrapped Express app to AWS

## Stories and Acceptance Criteria
### Example TODO body

```json
{
  "id" :0
  "order": [
    "57f78108-4704-41a9-989b-3721ceedfad1"
  ],
  "todos": {
    "57f78108-4704-41a9-989b-3721ceedfad1": {
      "name": "Add entry",
      "desc": "Personal log",
      "dateCreated": "1622077232207",
      "dateCompleted": "1622077232208",
      "pomodoroCount": 2
    }
  }
}
```

### Example TODO order body

```json
[
  "57f78108-4704-41a9-989b-3721ceedfad1",
  "3b23c502-9ac3-45cc-87d6-2221e69fa2b4",
  "06044689-64dc-4408-a6d3-8936f559c119"
]
```

---

As a user, I want to save a todo so that I can see it upon revisiting

    Given I have the details of my todo
    When I add a todo
    Then my todo is saved

POST /api/todo-data
201 Created

Request Body:

```json
{
  "name": "Add entry",
  "desc": "Personal log",
}
```

Response Body:

```json
{
  "order": [
    "57f78108-4704-41a9-989b-3721ceedfad1"
  ],
  "todos": {
    "57f78108-4704-41a9-989b-3721ceedfad1": {
      "name": "Add entry",
      "desc": "Personal log",
      "dateCreated": "1622077232207",
      "dateCompleted": "null",
      "pomodoroCount": 0
    }
  }
}
```

---

As a user, I want to view all of my saved todos in order

    Given I have saved multiple todos
    When I try to get all of my todos
    Then I get a list of my todos in order by id

GET /api/todo-data
200 OK

Response Body:
```json
{
  "order": [
    "57f78108-4704-41a9-989b-3721ceedfad1",
    "21f3e843-b7c0-4ddb-8df4-0111117bf2d8"
  ],
  "todos": {
      "57f78108-4704-41a9-989b-3721ceedfad1": {
        "name": "Add entry",
        "desc": "Personal log",
        "dateCreated": "1622077232207",
        "dateCompleted": "null",
        "pomodoroCount": 0
      },
      "21f3e843-b7c0-4ddb-8df4-0111117bf2d8": {
        "name": "Rep Building",
        "desc": "Physical Training",
        "dateCreated": "1622077232209",
        "dateCompleted": "null",
        "pomodoroCount": 0
      }
  }
}

```
---
As a user I want to update the order of my todos

    Given I have saved several todos
    When I change the order of them
    Then the order of the todo is saved so that when I revisit, it has peristed

PATCH /api/todo-data
204 No content

Request Body: 
```json
{
  order: [
    "d6b2e215-f095-402e-bf31-f75154a69329",
    "e61cf002-5fa4-41a2-9ace-a7bf4a284d33",
    "9b314719-0500-4e2f-a0f8-171b96766741"
  ]
}
```
---

As as user, I want to update a todo when I complete it

    Given I have saved a todo
    When I update a todo's completion date
    Then I my todo has an updated completion date

PATCH /api/todo-data/{todo-id}
204 No Content


Request Body:
```json
{
  "dateCompleted": "1622083278575"
}
```
As a user I want to update a todos name or description

    Given I have saved a todo
    When I update a todos name OR description
    Then the updated changes are saved

PATCH /api/todo-data/{todo-id}
204 No Content


Request Body:
```json
{
  "name": "WORKOUTMOAR",
  "desc": "Physical Training",
}
```


As a user I want to be able to record how many pomodoro intervals I have completed for a todo

    Given I have saved a todo
    When I complete a pomodoro interval with a chosen todo
    Then my todo has the saved pomodoro interval count

PATCH /api/todo-data/{todo-id}
204 No Content


Request Body:
```json
{
  "pomodoroCount": 1
}
```