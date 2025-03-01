"use client"

import { useState, useEffect, useRef, useContext } from "react"
import io from "socket.io-client"
import axios from "axios"
import { AuthContext } from "../context/AuthContext"
import SendIcon from "@mui/icons-material/Send"
import { Paper, TextField, IconButton, Typography, Box } from "@mui/material"

const socket = io("http://127.0.0.1:5050/", {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
})

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: "#e0f2f1",
  },
  header: {
    backgroundColor: "#00796b",
    padding: "1rem",
    color: "white",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  headerText: {
    fontSize: "1.5rem",
    fontWeight: 600,
    textAlign: "center",
    margin: 0,
  },
  messagesContainer: {
    flex: 1,
    padding: "1.5rem",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
    scrollBehavior: "smooth",
  },
  messageBox: {
    maxWidth: "85%",
    padding: "1.5rem",
    borderRadius: "16px",
    position: "relative",
    margin: "0.5rem 0",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    },
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#00796b",
    color: "white",
    boxShadow: "0 2px 12px rgba(0,121,107,0.2)",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "white",
    color: "#004d40",
    boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
  },
  adminMessage: {
    alignSelf: "center",
    backgroundColor: "#b2dfdb",
    color: "#004d40",
    maxWidth: "95%",
    boxShadow: "0 2px 12px rgba(178,223,219,0.3)",
  },
  timestamp: {
    fontSize: "0.75rem",
    opacity: 0.8,
    marginTop: "0.5rem",
  },
  inputContainer: {
    backgroundColor: "white",
    padding: "1rem",
    boxShadow: "0 -2px 4px rgba(0,0,0,0.1)",
  },
  inputGrid: {
    display: "grid",
    gap: "1rem",
    gridTemplateColumns: "1fr 1fr",
    marginBottom: "1rem",
  },
  messageInput: {
    gridColumn: "1 / -1",
  },
  sendButton: {
    backgroundColor: "#00796b",
    color: "white",
    borderRadius: "50%",
    padding: "0.5rem",
    "&:hover": {
      backgroundColor: "#004d40",
    },
  },
  productInfo: {
    fontSize: "0.95rem",
    marginTop: "1rem",
    padding: "0.75rem",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: "12px",
    backdropFilter: "blur(4px)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
}

const Chat = () => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [productName, setProductName] = useState("")
  const [review, setReview] = useState("")
  const [username, setUsername] = useState("")
  const { user } = useContext(AuthContext)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (window.location.pathname === "/adminhome/chat") {
      setUsername("Admin")
    } else {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(`http://127.0.0.1:8000/api/user/profile/${user}`)
          if (response.status === 200) {
            setUsername(response.data.data.username)
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        }
      }
      fetchUserData()
    }
  }, [user])

  useEffect(() => {
    console.log("Connecting to socket server...")
    fetch("http://127.0.0.1:5050/messages")
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch((err) => console.error("Error fetching messages:", err))

    socket.on("connect", () => {
      console.log("Socket connected successfully:", socket.id)
    })

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
    })

    socket.on("message", (message) => {
      console.log("Received message:", message)
      setMessages((prevMessages) => [...prevMessages, message])
    })

    return () => {
      console.log("Cleaning up socket connection...")
      socket.off("message")
      socket.off("connect")
      socket.off("connect_error")
      socket.disconnect()
    }
  }, [])

  const sendMessage = () => {
    if (!username || !input || !productName || !review) return

    const message = {
      username,
      text: input,
      product_name: productName,
      review: review,
      timestamp: new Date().toISOString(),
    }

    // Send message via HTTP POST first
    fetch("http://127.0.0.1:5050/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        console.log("Message sent successfully:", data)
        // Don't need to update messages here as the socket will emit it back
      })
      .catch((error) => {
        console.error("Error sending message:", error)
        // Fallback: update UI even if server request failed
        setMessages((prevMessages) => [...prevMessages, message])
      })

    setInput("")
    setProductName("")
    setReview("")
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <Box sx={styles.container}>
      <Box sx={styles.header}>
        <Typography sx={styles.headerText}>NutriCheck Community Chat</Typography>
      </Box>

      <Box sx={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <Paper
            key={index}
            elevation={2}
            sx={{
              ...styles.messageBox,
              ...(msg.username === "Admin"
                ? styles.adminMessage
                : msg.username === username
                  ? styles.myMessage
                  : styles.otherMessage),
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
              {msg.username}
            </Typography>
            <Typography variant="body1">{msg.text}</Typography>
            <Box sx={styles.productInfo}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                Product: {msg.product_name}
              </Typography>
              <Typography variant="body2">Review: {msg.review}</Typography>
            </Box>
            <Typography sx={styles.timestamp}>{new Date(msg.timestamp).toLocaleString()}</Typography>
          </Paper>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      <Paper sx={styles.inputContainer} elevation={4}>
        <Box sx={styles.inputGrid}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Enter product name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            size="small"
          />
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Enter review"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            size="small"
            multiline
            rows={2}
          />
          <Box sx={styles.inputWrapper}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              size="small"
              sx={styles.messageInput}
            />
            <IconButton onClick={sendMessage} disabled={!input || !productName || !review} sx={styles.sendButton}>
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

export default Chat

