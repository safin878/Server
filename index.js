const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.c9pict7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const addLessonCollection = client.db("VocabSakura").collection("Lessons");
    const AddVocabularyCollection = client
      .db("VocabSakura")
      .collection("Vocabularies");

    const userCollection = client.db("VocabSakura").collection("Users");

    //Add Lesson Start
    app.post("/addLessons", async (req, res) => {
      const user = req.body;

      const result = await addLessonCollection.insertOne(user);
      res.send(result);
    });

    app.get("/addLessons", async (req, res) => {
      const result = await addLessonCollection.find().toArray();
      res.send(result);
    });

    app.patch("/addLessons/:id", async (req, res) => {
      const lessonId = req.params.id;

      const { Lesson_Name, Lesson_Number } = req.body;
      const updatedLesson = {
        Lesson_Name,
        Lesson_Number,
      };

      try {
        const result = await addLessonCollection.updateOne(
          { _id: new ObjectId(lessonId) },
          { $set: updatedLesson }
        );

        if (result.modifiedCount === 0) {
          return res.status(404).send({ message: "Lesson not found" });
        }

        res.send({ message: "Lesson updated successfully" });
      } catch (error) {
        console.error("Error updating lesson:", error);
        res.status(500).send({ message: "Error updating lesson" });
      }
    });

    app.delete("/addLessons/:id", async (req, res) => {
      const lessonId = req.params.id;

      try {
        const result = await addLessonCollection.deleteOne({
          _id: new ObjectId(lessonId),
        });

        if (result.deletedCount === 0) {
          return res.status(404).send({ message: "Lesson not found" });
        }

        res.send({ message: "Lesson deleted successfully" });
      } catch (error) {
        console.error("Error deleting Lesson:", error);
        res.status(500).send({ message: "Error deleting Lesson" });
      }
    });

    //Add Lesson End

    //AddVocabulary Start

    app.post("/addVocabulary", async (req, res) => {
      const user = req.body;

      const result = await AddVocabularyCollection.insertOne(user);
      res.send(result);
    });

    app.get("/addVocabulary", async (req, res) => {
      const result = await AddVocabularyCollection.find().toArray();
      res.send(result);
    });

    app.patch("/addVocabulary/:id", async (req, res) => {
      const VocabId = req.params.id;

      const { Word, Meaning, Pronunciation, When_to_Say, Lesson_No } = req.body;
      const updatedVocab = {
        Word,
        Meaning,
        Pronunciation,
        When_to_Say,
        Lesson_No,
      };

      try {
        const result = await AddVocabularyCollection.updateOne(
          { _id: new ObjectId(VocabId) },
          { $set: updatedVocab }
        );

        if (result.modifiedCount === 0) {
          return res.status(404).send({ message: "Vocabulary not found" });
        }

        res.send({ message: "Vocabulary updated successfully" });
      } catch (error) {
        console.error("Error updating Vocabulary:", error);
        res.status(500).send({ message: "Error updating Vocabulary" });
      }
    });

    app.delete("/addVocabulary/:id", async (req, res) => {
      const VocabId = req.params.id;

      try {
        const result = await AddVocabularyCollection.deleteOne({
          _id: new ObjectId(VocabId),
        });

        if (result.deletedCount === 0) {
          return res.status(404).send({ message: "Vocabulary not found" });
        }

        res.send({ message: "Vocabulary deleted successfully" });
      } catch (error) {
        console.error("Error deleting Vocabulary:", error);
        res.status(500).send({ message: "Error deleting Vocabulary" });
      }
    });
    //AddVocabulary End

    //Manage User Start
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "User Already Exist" });
      }
      const result = await userCollection.insertOne(user);
      res.json(result);
    });

    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.patch("/users/update/:email", async (req, res) => {
      const { email } = req.params;
      const { role } = req.body;

      try {
        const result = await userCollection.updateOne(
          { email },
          { $set: { role } }
        );

        if (result.modifiedCount === 0) {
          return res
            .status(404)
            .send({ message: "User not found or role unchanged" });
        }

        res.send({ message: "Role updated successfully" });
      } catch (error) {
        console.error("Error updating role:", error);
        res.status(500).send({ message: "Error updating role" });
      }
    });

    //Some dynamic
    app.get("/addLessons", async (req, res) => {
      const { page = 1, limit = 1 } = req.query; // Default page 1, limit 1
      const skip = (page - 1) * limit;

      const result = await addLessonCollection
        .find()
        .skip(Number(skip))
        .limit(Number(limit))
        .toArray();
      res.send(result);
    });

    app.get("/addVocabulary/lesson/:lessonNumber", async (req, res) => {
      const { lessonNumber } = req.params;
      const { page = 1, limit = 1 } = req.query; // Default page 1, limit 1
      const skip = (page - 1) * limit;

      try {
        const result = await AddVocabularyCollection.find({
          Lesson_No: lessonNumber,
        })
          .skip(Number(skip))
          .limit(Number(limit))
          .toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching vocabularies:", error);
        res.status(500).send({ message: "Error fetching vocabularies" });
      }
    });

    app.get("/addLessonsWithCount", async (req, res) => {
      try {
        const lessons = await addLessonCollection.find().toArray();

        const lessonsWithCount = await Promise.all(
          lessons.map(async (lesson) => {
            const count = await AddVocabularyCollection.countDocuments({
              Lesson_No: lesson.Lesson_Number,
            });
            return { ...lesson, vocabularyCount: count };
          })
        );

        res.send(lessonsWithCount);
      } catch (error) {
        console.error("Error fetching lessons with vocabulary count:", error);
        res
          .status(500)
          .send({ message: "Error fetching lessons with vocabulary count" });
      }
    });

    app.get("/users/:email", async (req, res) => {
      const { email } = req.params;

      try {
        const user = await userCollection.findOne({ email });

        if (!user) {
          return res.status(404).send({ message: "User not found" });
        }

        res.send(user);
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).send({ message: "Error fetching user" });
      }
    });

    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
