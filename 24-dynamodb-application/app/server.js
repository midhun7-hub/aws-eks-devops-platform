const express = require("express");

const {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand
} = require("@aws-sdk/client-dynamodb");

const app = express();

app.use(express.json());

const client = new DynamoDBClient({
  region: "ap-south-1"
});

const TABLE_NAME = "irsa-users";


// WRITE CUSTOMER
app.post("/customer", async (req, res) => {
  try {
    const { user_id, name, email } = req.body;

    await client.send(
      new PutItemCommand({
        TableName: TABLE_NAME,
        Item: {
          user_id: { S: user_id },
          name: { S: name },
          email: { S: email }
        }
      })
    );

    res.json({
      message: "Customer created"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});


// READ CUSTOMER
app.get("/customer/:id", async (req, res) => {
  try {
    const result = await client.send(
      new GetItemCommand({
        TableName: TABLE_NAME,
        Key: {
          user_id: { S: req.params.id }
        }
      })
    );

    res.json(result.Item);

  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});


// UPDATE CUSTOMER
app.put("/customer/:id", async (req, res) => {
  try {

    const { name } = req.body;

    await client.send(
      new UpdateItemCommand({
        TableName: TABLE_NAME,
        Key: {
          user_id: { S: req.params.id }
        },
        UpdateExpression: "SET #n = :name",
        ExpressionAttributeNames: {
          "#n": "name"
        },
        ExpressionAttributeValues: {
          ":name": { S: name }
        }
      })
    );

    res.json({
      message: "Customer updated"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

app.listen(3000, () => {
  console.log("Customer Service running on port 3000");
});