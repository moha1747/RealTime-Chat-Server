const ws = new WebSocket("ws://localhost:8080")

ws.onopen = () => {
    console.log("Connected to WebSocket server")
}

ws.onmessage = (event) => {
    console.log("Message received:", event.data)
}

ws.onclose = () => {
    console.log("Disconnected from server")
}

export default ws