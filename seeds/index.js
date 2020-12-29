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
      author: "5fe5a377690cc3358029c82b",
      images: [
        {
          url:
            "https://res.cloudinary.com/dabgwgfzh/image/upload/v1609210565/BirdsOfNewZealand/khgsyjzj2rrpum2i1ood.jpg",
          filename: "BirdsOfNewZealand/khgsyjzj2rrpum2i1ood",
        },
        {
          url:
            "https://res.cloudinary.com/dabgwgfzh/image/upload/v1609210573/BirdsOfNewZealand/vqhvhs4k9kek1fhyket9.jpg",
          filename: "BirdsOfNewZealand/vqhvhs4k9kek1fhyket9",
        },
      ],
      geometry: {
        type: "Point",
        coordinates: [174.7626, -36.8483],
      },
    });
    await bird.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
