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
  for (let i = 0; i < birdSeed.length; i++) {
    const bird = new Bird({
      location: `${birdSeed[i].location}`,
      species: `${birdSeed[i].species}`,
      description: `${birdSeed[i].description}`,
      likeCount:`${birdSeed[i].likes}`,
      author: {
        _id: "5ff3b76cc2517e1738ddf3ff",
        email: "test@gmail.com",
        username: "test",
      },
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
        coordinates: [birdSeed[i].longitude, birdSeed[i].latitude],
      },
    });
    await bird.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
