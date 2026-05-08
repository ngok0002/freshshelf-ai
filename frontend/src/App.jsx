import { useState } from "react";
import "./index.css";

const API_URL = "http://localhost:5001";

function App() {
  const [formData, setFormData] = useState({
    productType: "milk",
    manufacturingDate: new Date().toISOString().split("T")[0],
    temperature: 4,
    humidity: 60,
    packagingCondition: "sealed",
  });

  const [prediction, setPrediction] = useState(null);
  const [question, setQuestion] = useState("");
  const [assistantAnswer, setAssistantAnswer] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handlePredict(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Prediction failed");
        return;
      }

      setPrediction(data);
    } catch (error) {
      console.error(error);
      alert("Prediction failed. Please make sure backend is running.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAsk() {
    if (!question.trim()) {
      alert("Please enter a question.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Question answering failed");
        return;
      }

      setAssistantAnswer(data);
    } catch (error) {
      console.error(error);
      alert("Question answering failed. Please make sure backend is running.");
    }
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div>
          <div className="logo">FreshShelf AI</div>
          <div>Food shelf-life estimation dashboard</div>
        </div>
        <div className="badge">Rule-based agent workflow</div>
      </nav>

      <main className="container">
        <section className="hero">
          <div className="hero-label">Food shelf-life prototype</div>
          <h1>
            Estimate product freshness using storage conditions and simple AI-style reasoning.
          </h1>
          <p>
            Enter product information, simulate storage conditions, and receive
            shelf-life prediction, risk factors, recommendations, and
            knowledge-based storage advice.
          </p>
        </section>

        <section className="grid">
          <div className="card">
            <h2>Product Input</h2>
            <p>
              Adjust the conditions to simulate different storage scenarios.
            </p>

            <form onSubmit={handlePredict}>
              <div className="form-group">
                <label>Product type</label>
                <select
                  name="productType"
                  value={formData.productType}
                  onChange={handleChange}
                >
                  <option value="milk">Milk</option>
                  <option value="bread">Bread</option>
                  <option value="meat">Meat</option>
                  <option value="fruit">Fruit</option>
                  <option value="vegetables">Vegetables</option>
                </select>
              </div>

              <div className="form-group">
                <label>Manufacturing date</label>
                <input
                  type="date"
                  name="manufacturingDate"
                  value={formData.manufacturingDate}
                  onChange={handleChange}
                />
              </div>

              <div className="two-cols">
                <div className="form-group">
                  <label>Storage temperature (°C)</label>
                  <input
                    type="number"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Humidity (%)</label>
                  <input
                    type="number"
                    name="humidity"
                    value={formData.humidity}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Packaging condition</label>
                <select
                  name="packagingCondition"
                  value={formData.packagingCondition}
                  onChange={handleChange}
                >
                  <option value="sealed">Sealed</option>
                  <option value="opened">Opened</option>
                  <option value="vacuum-packed">Vacuum-packed</option>
                  <option value="damaged">Damaged</option>
                </select>
              </div>

              <button className="primary-btn" type="submit">
                {loading ? "Running prediction..." : "Run Shelf-Life Prediction"}
              </button>
            </form>
          </div>

          <div className="card">
            <h2>Prediction Result</h2>
            <p>
              The backend coordinates product analysis, prediction, risk
              evaluation, knowledge retrieval, and recommendation generation.
            </p>

            {!prediction && (
              <div className="empty">
                No prediction yet. Fill in the form and run the model.
              </div>
            )}

            {prediction && (
              <>
                <div className="result-grid">
                  <div className="metric">
                    <div className="metric-title">Remaining shelf life</div>
                    <div className="metric-value">
                      {prediction.estimatedRemainingDays} days
                    </div>
                  </div>

                  <div className="metric">
                    <div className="metric-title">Risk level</div>
                    <div className={`risk ${prediction.riskLevel}`}>
                      {prediction.riskLevel}
                    </div>
                  </div>
                </div>

                <div className="source-box">
                  <strong>Risk factors</strong>
                  {prediction.riskFactors.length === 0 ? (
                    <p>No major risk factors detected.</p>
                  ) : (
                    <ul>
                      {prediction.riskFactors.map((factor, index) => (
                        <li key={index}>{factor}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="info-box">
                  <strong>Recommendation</strong>
                  <p>{prediction.recommendation}</p>
                </div>

                <div className="source-box">
                  <strong>Retrieved knowledge</strong>
                  {prediction.retrievedKnowledge.map((item) => (
                    <p key={item.id}>{item.advice}</p>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        <section className="card assistant">
          <h2>Knowledge Assistant</h2>
          <p>
            Ask simple questions about storage conditions. The backend searches
            a local food storage knowledge base.
          </p>

          <div className="ask-row">
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Example: How should I store milk?"
            />
            <button className="dark-btn" onClick={handleAsk}>
              Ask
            </button>
          </div>

          {assistantAnswer && (
            <div className="answer">
              <strong>Answer</strong>
              <p>{assistantAnswer.answer}</p>

              {assistantAnswer.sources.length > 0 && (
                <>
                  <strong>Source evidence</strong>
                  {assistantAnswer.sources.map((source) => (
                    <div className="source-box" key={source.id}>
                      {source.advice}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;