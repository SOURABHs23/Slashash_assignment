import express from "express";
import cors from "cors";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

pool.connect((e) => {
  if (e) {
    console.log(e);
  } else {
    console.log("db connected successfully");
  }
});

// // Save favourite
app.post("/favourites", async (req, res) => {
  const { Title, Year, Type, Poster } = req.body;

  console.log(req.body);
  const movie = {
    title: Title,
    year: Year,
    type: Type,
    poster: Poster,
  };
  try {
    const result = await pool.query(
      "INSERT INTO favourites (title, year, type, poster) VALUES ($1, $2, $3, $4) RETURNING *",
      [movie.title, movie.year, movie.type, movie.poster]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error saving to database:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// // Get all favourites
app.get("/favourites", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM favourites");
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
