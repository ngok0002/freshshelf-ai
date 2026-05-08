const knowledgeBase = require("./knowledgeBase.json");

const BASE_SHELF_LIFE = {
  milk: 7,
  bread: 5,
  meat: 3,
  fruit: 7,
  vegetables: 6,
};

const RECOMMENDED_TEMP = {
  milk: 4,
  bread: 22,
  meat: 4,
  fruit: 10,
  vegetables: 8,
};

function getDaysSinceManufacture(manufacturingDate) {
  const today = new Date();
  const mfgDate = new Date(manufacturingDate);

  const diffMs = today - mfgDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return Math.max(diffDays, 0);
}

function analyzeProduct(input) {
  const productType = input.productType.toLowerCase();

  return {
    productType,
    baseShelfLife: BASE_SHELF_LIFE[productType] || 5,
    recommendedTemp: RECOMMENDED_TEMP[productType] || 10,
  };
}

function estimateShelfLife(profile, input) {
  let remainingDays = profile.baseShelfLife;

  const ageDays = getDaysSinceManufacture(input.manufacturingDate);
  remainingDays -= ageDays;

  const tempDifference = input.temperature - profile.recommendedTemp;

  if (tempDifference > 0) {
    remainingDays -= Math.ceil(tempDifference / 2);
  }

  if (input.humidity > 75) {
    remainingDays -= 1;
  }

  if (input.humidity > 90) {
    remainingDays -= 2;
  }

  if (input.packagingCondition === "opened") {
    remainingDays -= 2;
  }

  if (input.packagingCondition === "damaged") {
    remainingDays -= 3;
  }

  if (input.packagingCondition === "vacuum-packed") {
    remainingDays += 1;
  }

  return Math.max(remainingDays, 0);
}

function evaluateRisk(remainingDays, input, profile) {
  const riskFactors = [];

  if (remainingDays <= 1) {
    riskFactors.push("Very low remaining shelf life");
  }

  if (input.temperature > profile.recommendedTemp) {
    riskFactors.push("Storage temperature is higher than recommended");
  }

  if (input.humidity > 75) {
    riskFactors.push("Humidity level is high");
  }

  if (input.packagingCondition === "opened") {
    riskFactors.push("Packaging has been opened");
  }

  if (input.packagingCondition === "damaged") {
    riskFactors.push("Packaging is damaged");
  }

  let riskLevel = "Low";

  if (remainingDays <= 2 || riskFactors.length >= 2) {
    riskLevel = "Medium";
  }

  if (remainingDays <= 1 || riskFactors.length >= 3) {
    riskLevel = "High";
  }

  return {
    riskLevel,
    riskFactors,
  };
}

function retrieveKnowledge(productType, question = "") {
  const query = `${productType} ${question}`.toLowerCase();

  const scoredItems = knowledgeBase.map((item) => {
    let score = 0;

    if (item.productType === productType) {
      score += 2;
    }

    item.keywords.forEach((keyword) => {
      if (query.includes(keyword.toLowerCase())) {
        score += 1;
      }
    });

    return {
      ...item,
      score,
    };
  });

  scoredItems.sort((a, b) => b.score - a.score);

  return scoredItems.slice(0, 2);
}

function generateRecommendation(riskLevel, remainingDays) {
  if (riskLevel === "High") {
    return "High spoilage risk. The product should be checked carefully and consumed immediately or discarded if there are signs of spoilage.";
  }

  if (riskLevel === "Medium") {
    return `Moderate risk. The product should ideally be consumed within ${remainingDays} day(s), and storage conditions should be improved.`;
  }

  return `Low risk. The product is likely acceptable for around ${remainingDays} more day(s) if stored properly.`;
}

function runShelfLifeAgent(input) {
  const profile = analyzeProduct(input);
  const remainingDays = estimateShelfLife(profile, input);
  const risk = evaluateRisk(remainingDays, input, profile);
  const knowledge = retrieveKnowledge(profile.productType);
  const recommendation = generateRecommendation(risk.riskLevel, remainingDays);

  return {
    productType: profile.productType,
    estimatedRemainingDays: remainingDays,
    riskLevel: risk.riskLevel,
    riskFactors: risk.riskFactors,
    recommendation,
    retrievedKnowledge: knowledge,
    explanation: {
      baseShelfLife: profile.baseShelfLife,
      recommendedTemperature: profile.recommendedTemp,
      method:
        "This prototype uses rule-based logic for explainability. It can be extended with ML regression or time-series models in the future.",
    },
  };
}

function answerQuestion(question) {
  const query = question.toLowerCase();

  const scoredItems = knowledgeBase.map((item) => {
    let score = 0;

    item.keywords.forEach((keyword) => {
      if (query.includes(keyword.toLowerCase())) {
        score += 1;
      }
    });

    if (query.includes(item.productType)) {
      score += 2;
    }

    return {
      ...item,
      score,
    };
  });

  scoredItems.sort((a, b) => b.score - a.score);

  const sources = scoredItems.filter((item) => item.score > 0).slice(0, 2);

  if (sources.length === 0) {
    return {
      answer:
        "I could not find a specific answer in the local knowledge base. Try asking about milk, bread, meat, fruit, vegetables, temperature, humidity, or packaging.",
      sources: [],
    };
  }

  return {
    answer: sources.map((item) => item.advice).join(" "),
    sources,
  };
}

module.exports = {
  runShelfLifeAgent,
  answerQuestion,
};