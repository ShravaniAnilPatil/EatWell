import { useState } from "react"
import axios from "axios"

const makePrediction = async (inputData, modelName = "lightgbm") => {
  try {
    const response = await axios.post("http://localhost:5005/api/predict", {
      ...inputData,
      model_name: modelName,
    })
    return response.data
  } catch (error) {
    console.error("Error making prediction:", error)
    throw error
  }
}

const PredictForm = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    Protein: 0,
    Fat: 0,
    Sodium: 0,
    Carbohydrates: 0,
    Fiber: 0,
    Sugar: 0,
  })
  const [modelName, setModelName] = useState("lightgbm")
  const [results, setResults] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: Number.parseFloat(value) || 0,
    })
  }

  const handleModelChange = (e) => {
    setModelName(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setResults(null)

    try {
      const result = await makePrediction(formData, modelName)
      setResults({
        inputData: formData,
        modelName,
        prediction: result.prediction,
        probabilities: result.probabilities,
      })
    } catch (err) {
      setError("Error making prediction. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getProbClass = (probability) => {
    if (probability > 0.7) return "bg-success"
    if (probability > 0.4) return "bg-warning"
    return "bg-danger"
  }

  return (
    <div className="container py-4 mt-5">
      {" "}
      {/* Added mt-5 to account for navbar */}
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow-sm mb-4 border-0 rounded-3">
            <div className="card-header bg-primary text-white py-3 rounded-top">
              <h2 className="h4 mb-0 fw-bold">Food Nutritional Analysis</h2>
            </div>
            <div className="card-body p-4">
              {error && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row mb-4">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Select Model</label>
                    <select
                      className="form-select form-select-lg shadow-sm"
                      value={modelName}
                      onChange={handleModelChange}
                    >
                      <option value="lightgbm">LightGBM</option>
                      <option value="xgboost">XGBoost</option>
                    </select>
                  </div>
                </div>

                <div className="row g-4 mb-4">
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        id="protein"
                        name="Protein"
                        value={formData.Protein}
                        onChange={handleChange}
                        placeholder="Protein"
                      />
                      <label htmlFor="protein">Protein (g)</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        id="carbs"
                        name="Carbohydrates"
                        value={formData.Carbohydrates}
                        onChange={handleChange}
                        placeholder="Carbohydrates"
                      />
                      <label htmlFor="carbs">Carbohydrates (g)</label>
                    </div>
                  </div>
                </div>

                <div className="row g-4 mb-4">
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        id="fat"
                        name="Fat"
                        value={formData.Fat}
                        onChange={handleChange}
                        placeholder="Fat"
                      />
                      <label htmlFor="fat">Fat (g)</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        id="sugar"
                        name="Sugar"
                        value={formData.Sugar}
                        onChange={handleChange}
                        placeholder="Sugar"
                      />
                      <label htmlFor="sugar">Sugar (g)</label>
                    </div>
                  </div>
                </div>

                <div className="row g-4 mb-4">
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        id="fiber"
                        name="Fiber"
                        value={formData.Fiber}
                        onChange={handleChange}
                        placeholder="Fiber"
                      />
                      <label htmlFor="fiber">Fiber (g)</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        id="sodium"
                        name="Sodium"
                        value={formData.Sodium}
                        onChange={handleChange}
                        placeholder="Sodium"
                      />
                      <label htmlFor="sodium">Sodium (mg)</label>
                    </div>
                  </div>
                </div>

                <div className="d-grid mt-4">
                  <button type="submit" className="btn btn-primary btn-lg py-3 fw-bold" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Processing...
                      </>
                    ) : (
                      "Get Health Classification"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {results && (
            <div className="card shadow border-0 rounded-3 mb-5 animate__animated animate__fadeIn">
              <div className="card-header bg-success text-white py-3 rounded-top">
                <h3 className="h5 mb-0 fw-bold">Prediction Results</h3>
              </div>
              <div className="card-body p-4">
                <div className="alert alert-info d-flex align-items-center">
                  <div className="me-3">
                    <i className="bi bi-info-circle-fill fs-3"></i>
                  </div>
                  <div>
                    <h4 className="alert-heading">
                      Predicted Class: <strong>{results.prediction}</strong>
                    </h4>
                    <p className="mb-0">Using {results.modelName.toUpperCase()} model</p>
                  </div>
                </div>

                <div className="card bg-light border-0 p-3 mb-4">
                  <h5 className="card-title border-bottom pb-2 mb-3">Class Probabilities</h5>
                  {Object.entries(results.probabilities).map(([className, prob]) => (
                    <div key={className} className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="fw-semibold">{className}</span>
                        <span className="badge bg-secondary">{(prob * 100).toFixed(2)}%</span>
                      </div>
                      <div className="progress" style={{ height: "10px" }}>
                        <div
                          className={`progress-bar ${getProbClass(prob)}`}
                          style={{ width: `${prob * 100}%` }}
                          role="progressbar"
                          aria-valuenow={prob * 100}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="card bg-light border-0 p-3">
                  <h5 className="card-title border-bottom pb-2 mb-3">Input Summary</h5>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Nutrient</th>
                          <th>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(results.inputData).map(([feature, value]) => (
                          <tr key={feature}>
                            <td>{feature}</td>
                            <td>
                              {value} {feature === "Sodium" ? "mg" : "g"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="d-flex justify-content-end mt-4">
                  <button onClick={() => window.print()} className="btn btn-outline-primary d-flex align-items-center">
                    <i className="bi bi-printer me-2"></i>
                    Print Results
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PredictForm

