"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const makePrediction = async (inputData, modelName = "lightgbm") => {
  try {
    console.log("Sending prediction data:", inputData)
    const response = await axios.post(
      "http://localhost:5007/api/predict",
      {
        ...inputData,
        model_name: modelName,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    return response.data
  } catch (error) {
    console.error("Error making prediction:", error.response?.data || error.message)
    throw error
  }
}

const PredictForm = ({ prefillData }) => {
  const [formData, setFormData] = useState({
    Protein: 0,
    Fat: 0,
    Sodium: 0,
    Carbohydrates: 0,
    Fiber: 0,
    Sugar: 0,
  })
  const [modelName, setModelName] = useState("lightgbm")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [results, setResults] = useState(null)
  const [autoPredicted, setAutoPredicted] = useState(false)

  // This effect runs when prefillData changes
  useEffect(() => {
    if (prefillData && Object.keys(prefillData).length > 0) {
      console.log("Received prefill data:", prefillData)

      // The prefillData is now directly the nutritional values object
      // No need to extract from a nested structure
      const newFormData = {
        Protein: Number.parseFloat(prefillData.Protein || 0),
        Fat: Number.parseFloat(prefillData.Fat || 0),
        Sodium: Number.parseFloat(prefillData.Sodium || 0),
        Carbohydrates: Number.parseFloat(prefillData.Carbohydrates || 0),
        Fiber: Number.parseFloat(prefillData.Fiber || 0),
        Sugar: Number.parseFloat(prefillData.Sugar || 0),
      }

      console.log("Setting form data to:", newFormData)
      setFormData(newFormData)

      // Automatically trigger prediction when data is received
      if (!autoPredicted && Object.values(newFormData).some((val) => val > 0)) {
        setAutoPredicted(true)
        handlePrediction(newFormData)
      }
    }
  }, [prefillData])

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

  const handlePrediction = async (data) => {
    setLoading(true)
    setError("")
    setResults(null)

    try {
      const result = await makePrediction(data, modelName)
      setResults({
        inputData: data,
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    handlePrediction(formData)
  }

  const getProbClass = (probability) => {
    if (probability > 0.7) return { backgroundColor: "#28a745" }
    if (probability > 0.4) return { backgroundColor: "#ffc107" } // warning
    return { backgroundColor: "#dc3545" } // danger
  }

  const styles = {
    container: {
      padding: "1rem 0.5rem",
      marginTop: "1rem",
      width: "100%",
      boxSizing: "border-box",
    },
    row: {
      display: "flex",
      flexWrap: "wrap",
      width: "100%",
    },
    column: {
      flex: "0 0 100%",
      maxWidth: "100%",
      padding: "0 0.5rem",
      position: "relative",
      width: "100%",
    },
    card: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      minWidth: "0",
      wordWrap: "break-word",
      backgroundColor: "#fff",
      backgroundClip: "border-box",
      border: "0",
      borderRadius: "0.25rem",
      boxShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)",
      marginBottom: "0.75rem",
    },
    cardHeader: {
      padding: "0.5rem 1rem",
      marginBottom: "0",
      backgroundColor: "#2f524d",
      color: "#fff",
      borderTopLeftRadius: "0.25rem",
      borderTopRightRadius: "0.25rem",
    },
    cardHeaderSuccess: {
      backgroundColor: "#2f524d",
      color: "#fff",
    },
    cardTitle: {
      fontSize: "1.1rem",
      fontWeight: "700",
      margin: "0",
    },
    cardBody: {
      flex: "1 1 auto",
      padding: "0.75rem 1rem",
    },
    formRow: {
      display: "flex",
      flexWrap: "wrap",
      width: "100%",
      marginBottom: "0.75rem",
    },
    formColumn: {
      flex: "1",
      padding: "0 0.5rem",
      position: "relative",
      minWidth: "150px",
    },
    formColumnSelect: {
      flex: "0 0 250px",
      padding: "0 0.5rem",
    },
    formLabel: {
      display: "inline-block",
      marginBottom: "0.25rem",
      fontWeight: "600",
      fontSize: "0.9rem",
    },
    formControl: {
      display: "block",
      width: "100%",
      padding: "0.25rem 0.5rem",
      fontSize: "0.9rem",
      lineHeight: "1.5",
      color: "#495057",
      backgroundColor: "#fff",
      backgroundClip: "padding-box",
      border: "1px solid #ced4da",
      borderRadius: "0.25rem",
      transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
      height: "2.5rem",
    },
    formSelect: {
      display: "block",
      width: "100%",
      padding: "0.25rem 0.5rem",
      fontSize: "0.9rem",
      lineHeight: "1.5",
      color: "#2f524d",
      backgroundColor: "#fff",
      backgroundClip: "padding-box",
      border: "1px solid #ced4da",
      borderRadius: "0.25rem",
      boxShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)",
      appearance: "none",
      height: "2.5rem",
    },
    button: {
      display: "inline-block",
      fontWeight: "600",
      textAlign: "center",
      whiteSpace: "nowrap",
      verticalAlign: "middle",
      userSelect: "none",
      border: "1px solid transparent",
      padding: "0.375rem 0.75rem",
      fontSize: "1rem",
      lineHeight: "1.5",
      borderRadius: "0.25rem",
      transition:
        "color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
      color: "#fff",
      backgroundColor: "#2f524d",
      borderColor: "#2f524d",
      width: "20%",
      cursor: "pointer",
    },
    buttonDisabled: {
      opacity: "0.65",
      pointerEvents: "none",
    },
    alert: {
      position: "relative",
      padding: "0.5rem 0.75rem",
      marginBottom: "0.75rem",
      border: "1px solid transparent",
      borderRadius: "0.25rem",
      display: "flex",
      alignItems: "center",
      fontSize: "0.9rem",
    },
    alertDanger: {
      color: "#721c24",
      backgroundColor: "#f8d7da",
      borderColor: "#f5c6cb",
    },
    alertInfo: {
      color: "#0c5460",
      backgroundColor: "#d1ecf1",
      borderColor: "#bee5eb",
    },
    spinner: {
      display: "inline-block",
      width: "1rem",
      height: "1rem",
      verticalAlign: "text-bottom",
      border: "0.25em solid currentColor",
      borderRightColor: "transparent",
      borderRadius: "50%",
      animation: "spinner-border 0.75s linear infinite",
      marginRight: "0.5rem",
    },
    cardLight: {
      backgroundColor: "#f8f9fa",
      border: "0",
      padding: "0.75rem",
      marginBottom: "0.75rem",
    },
    cardTitleBordered: {
      borderBottom: "1px solid #dee2e6",
      paddingBottom: "0.25rem",
      marginBottom: "0.5rem",
      fontSize: "1rem",
      fontWeight: "500",
    },
    progress: {
      display: "flex",
      height: "8px",
      overflow: "hidden",
      fontSize: "0.75rem",
      backgroundColor: "#e9ecef",
      borderRadius: "0.25rem",
    },
    progressBar: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      overflow: "hidden",
      color: "#fff",
      textAlign: "center",
      whiteSpace: "nowrap",
      transition: "width 0.6s ease",
    },
    badge: {
      display: "inline-block",
      padding: "0.2em 0.4em",
      fontSize: "75%",
      fontWeight: "700",
      lineHeight: "1",
      textAlign: "center",
      whiteSpace: "nowrap",
      verticalAlign: "baseline",
      borderRadius: "0.25rem",
      color: "#fff",
      backgroundColor: "#6c757d",
    },
    table: {
      width: "100%",
      marginBottom: "0.75rem",
      color: "#212529",
      borderCollapse: "collapse",
      fontSize: "0.9rem",
    },
    tableResponsive: {
      display: "block",
      width: "100%",
      overflowX: "auto",
    },
    tableHead: {
      backgroundColor: "#f8f9fa",
    },
    tableCell: {
      padding: "0.5rem",
      verticalAlign: "top",
      borderTop: "1px solid #dee2e6",
    },
    flexBetween: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "0.25rem",
    },
    flexEnd: {
      display: "flex",
      justifyContent: "center",
      marginTop: "0.75rem",
    },
    outlineButton: {
      color: "#0d6efd",
      backgroundColor: "transparent",
      backgroundImage: "none",
      borderColor: "#0d6efd",
      display: "flex",
      alignItems: "center",
      padding: "0.25rem 0.5rem",
      fontSize: "0.875rem",
    },
    icon: {
      marginRight: "0.5rem",
    },
    fadeIn: {
      animation: "fadeIn 0.5s",
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: "0.75rem",
      width: "100%",
    },
    "@keyframes fadeIn": {
      "0%": { opacity: 0 },
      "100%": { opacity: 1 },
    },
    "@keyframes spinner-border": {
      to: { transform: "rotate(360deg)" },
    },
  }

  return (
    <div style={styles.container}>
      <div style={styles.row}>
        <div style={styles.column}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Food Nutritional Analysis</h2>
            </div>
            <div style={styles.cardBody}>
              {error && (
                <div style={{ ...styles.alert, ...styles.alertDanger }}>
                  <span style={styles.icon}>⚠️</span>
                  <div>{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={styles.formRow}>
                  <div style={styles.formColumnSelect}>
                    <label style={styles.formLabel}>Select Model</label>
                    <select style={styles.formSelect} value={modelName} onChange={handleModelChange}>
                      <option value="lightgbm">LightGBM</option>
                      <option value="xgboost">XGBoost</option>
                    </select>
                  </div>
                </div>

                <div style={styles.formGrid}>
                  <div>
                    <label style={styles.formLabel} htmlFor="protein">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      style={styles.formControl}
                      id="protein"
                      name="Protein"
                      value={formData.Protein}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label style={styles.formLabel} htmlFor="carbs">
                      Carbohydrates (g)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      style={styles.formControl}
                      id="carbs"
                      name="Carbohydrates"
                      value={formData.Carbohydrates}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label style={styles.formLabel} htmlFor="fat">
                      Fat (g)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      style={styles.formControl}
                      id="fat"
                      name="Fat"
                      value={formData.Fat}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label style={styles.formLabel} htmlFor="sugar">
                      Sugar (g)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      style={styles.formControl}
                      id="sugar"
                      name="Sugar"
                      value={formData.Sugar}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label style={styles.formLabel} htmlFor="fiber">
                      Fiber (g)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      style={styles.formControl}
                      id="fiber"
                      name="Fiber"
                      value={formData.Fiber}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label style={styles.formLabel} htmlFor="sodium">
                      Sodium (mg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      style={styles.formControl}
                      id="sodium"
                      name="Sodium"
                      value={formData.Sodium}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div style={{ marginTop: "0.75rem" }}>
                  <button
                    type="submit"
                    style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span style={styles.spinner} role="status" aria-hidden="true"></span>
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
            <div style={{ ...styles.card, ...styles.fadeIn }}>
              <div style={{ ...styles.cardHeader, ...styles.cardHeaderSuccess }}>
                <h3 style={styles.cardTitle}>Prediction Results</h3>
              </div>
              <div style={styles.cardBody}>
                <div style={{ ...styles.alert, ...styles.alertInfo }}>
                  <div style={{ marginRight: "0.5rem" }}>
                    <span style={{ fontSize: "1.2rem" }}>ℹ️</span>
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "1rem" }}>
                      Predicted Class: <strong>{results.prediction}</strong>
                    </h4>
                    <p style={{ margin: 0, fontSize: "0.9rem" }}>Using {results.modelName.toUpperCase()} model</p>
                  </div>
                </div>

                <div style={styles.cardLight}>
                  <h5 style={styles.cardTitleBordered}>Class Probabilities</h5>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "0.75rem",
                    }}
                  >
                    {Object.entries(results.probabilities).map(([className, prob]) => (
                      <div key={className}>
                        <div style={styles.flexBetween}>
                          <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>{className}</span>
                          <span style={styles.badge}>{(prob * 100).toFixed(2)}%</span>
                        </div>
                        <div style={styles.progress}>
                          <div
                            style={{
                              ...styles.progressBar,
                              ...getProbClass(prob),
                              width: `${prob * 100}%`,
                            }}
                            role="progressbar"
                            aria-valuenow={prob * 100}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* <div style={{ ...styles.cardLight, marginTop: "0.75rem" }}>
                  <h5 style={styles.cardTitleBordered}>Input Summary</h5>
                  <div style={styles.tableResponsive}>
                    <table style={styles.table}>
                      <thead style={styles.tableHead}>
                        <tr>
                          <th style={styles.tableCell}>Nutrient</th>
                          <th style={styles.tableCell}>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(results.inputData).map(([feature, value]) => (
                          <tr key={feature}>
                            <td style={styles.tableCell}>{feature}</td>
                            <td style={styles.tableCell}>
                              {value} {feature === "Sodium" ? "mg" : "g"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div> */}

                <div style={styles.flexEnd}>
                  <button onClick={() => window.print()} style={{ ...styles.button, ...styles.outlineButton }}>
                    <span style={styles.icon}>🖨️</span>
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
