const express = require("express");
const path = require("path");
const bodyparser = require("body-parser");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const url = "mongodb://localhost:27017";
const dbName = "wt";
let db, usersCollection;

MongoClient.connect(url)
  .then(client => {
    console.log("Database connected successfully");
    db = client.db(dbName);
    usersCollection = db.collection("exp7");
  })
  .catch(err => {
    console.log("Database connection error:", err);
  });


app.use(express.static(path.join(__dirname, 'public')));


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index3.html'));
});


app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const newUser = { username, email, password };
    await usersCollection.insertOne(newUser);
    console.log("User registered successfully");
    res.status(200).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: 'An error occurred' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await usersCollection.findOne({ email, password });
    if (user) {
      console.log("Login successful");
      res.status(200).json({ message: 'Login successful' });
    } else {
      console.log("Incorrect email or password");
      res.status(401).json({ message: 'Incorrect email or password' });
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: 'An error occurred' });
  }
});

app.post('/update', async (req, res) => {
  const { email, password, newEmail, newPassword } = req.body;

  try {
    const user = await usersCollection.findOne({ email, password });
    if (user) {
      // Update user's email and password
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { email: newEmail, password: newPassword } }
      );
      console.log("User updated successfully");
      res.status(200).json({ message: 'User updated successfully' });
    } else {
      console.log("Incorrect email or password");
      res.status(401).json({ message: 'Incorrect email or password' });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: 'An error occurred' });
  }
});

app.post('/delete', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await usersCollection.findOne({ email, password });
    if (user) {
     
      await usersCollection.deleteOne({ _id: user._id });
      console.log("User deleted successfully");
      res.status(200).json({ message: 'User deleted successfully' });
    } else {
      console.log("Incorrect email or password");
      res.status(401).json({ message: 'Incorrect email or password' });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: 'An error occurred' });
  }
});


app.post('/find', async (req, res) => {
  const { email } = req.body;

  if (email !== 'admin1@gmail.com') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const users = await usersCollection.find({ email: { $ne: 'admin1@gmail.com' } }).toArray();
    console.log("Users found successfully");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error finding users:", error);
    res.status(500).json({ message: 'An error occurred' });
  }
});

const port = 8448;
app.listen(port, () => {
  console.log(`Server running on Port: ${port}`);
});
