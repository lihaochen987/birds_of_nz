const mongoose = require("mongoose");
const birdSeed = require("./bird_seed");
const Bird = require("../models/bird");

mongoose.connect("mongodb://localhost:27017/birds-of-nz", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const seedDB = async () => {
  await Bird.deleteMany({});
  for (let i = 0; i < 10; i++) {
    const bird = new Bird({
      location: `${birdSeed[i].location}, New Zealand`,
      species: `${birdSeed[i].species}`,
      description: `${birdSeed[i].description}`,
      image:
        "https://images.unsplash.com/photo-1599367446256-77d27677e52f?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    });
    await bird.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
