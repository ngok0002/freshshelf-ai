const express = require("express");
const cors = require("cors");

const { runShelfLifeAgent, answerQuestion } = require("./shelfLifeAgent");

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "FreshShelf AI backend is running",
  });
});

app.post("/api/predict", (req, res) => {
  try {
    const {
      productType,
      manufacturingDate,
      temperature,
      humidity,
      packagingCondition,
    } = req.body;

    if (
      !productType ||
      !manufacturingDate ||
      temperature === undefined ||
      humidity === undefined ||
      !packagingCondition
    ) {
      return res.status(400).json({
        error: "Missing required input fields",
      });
    }

    const result = runShelfLifeAgent({
      productType,
      manufacturingDate,
      temperature: Number(temperature),
      humidity: Number(humidity),
      packagingCondition,
    });

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      error: "Prediction failed",
      details: error.message,
    });
  }
});

app.post("/api/ask", (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim() === "") {
      return res.status(400).json({
        error: "Question cannot be empty",
      });
    }

    const result = answerQuestion(question);

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      error: "Question answering failed",
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`FreshShelf AI backend running on http://localhost:${PORT}`);
});