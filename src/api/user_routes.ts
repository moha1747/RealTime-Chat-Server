// Get users/:id
// Put users/:id
// Delete users/:id



/**
 * Below is the **next set of “subproblems”** in a **LeetCode-style** format, 
 * continuing from your completed `ws_manager` methods. Each subproblem focuses on **WebSocket events** 
 * for a real-time chat. We’ll provide:

- **Problem Statement**  
- **Input/Output Format**  
- **Constraints**  
- **Test Cases**  
- **Solution Outline**  

**No code**—only the conceptual approach.

---

## 1) **Subproblem: “join_channel” Event**  

### **1.1 Problem Statement**  
You have a real-time chat system where each user can join various channels. 
Your goal is to **handle** an event called `"join_channel"` that arrives via WebSockets. 
When a user sends this event, the system must:

1. Identify **which user** and **which channel** they’re joining.  
2. **Register** their WebSocket connection in a data structure so that future broadcasts reach them.  
3. Optionally **notify** the channel that a new user has joined.

Essentially, you’re hooking into your `addUserToChannel(userId, channelId, ws)`
logic from `ws_manager`.

### **1.2 Input/Output Format**  
- **Input (via WebSocket event)**:
  ```json
  {
    "event": "join_channel",
    "userId": "<string>",
    "channelId": "<string>"
  }
  ```
- **Process**: The system must add the user’s WebSocket to the channel’s set of active sockets.  
- **Output**: (No direct output to the sender unless you want to confirm success). Possibly:
  ```json
  { "event": "joined_channel", "channelId": "<string>", "userId": "<string>" }
  ```
  Or it could be silent.

### **1.3 Constraints**  
- **Multiple channels** can exist.  
- A user can be in **multiple channels** simultaneously.  
- The user’s WebSocket must be stored **uniquely** per channel.  
- If a user is already joined, no duplication should occur—should handle gracefully.

### **1.4 Test Cases**  
**Test Case A**  
- **Input**: `{"event": "join_channel", "userId": "U1", "channelId": "C1"}`  
- **Expected Process**:  
  - The system calls `addUserToChannel("U1", "C1", ws)`.  
  - Now `channelUsers["C1"]` contains the user’s WebSocket.  
- **Expected Output**: Possibly `{"event": "joined_channel", "userId": "U1", "channelId": "C1"}` 
or no output if you choose.

**Test Case B**  
- **Input**: `{"event": "join_channel", "userId": "U2", "channelId": "C1"}`
 (another user joins same channel)  
- **Expected**:  
  - `channelUsers["C1"]` should now have **two** distinct WebSocket connections.  

**Test Case C**  
- **Input**: `{"event": "join_channel", "userId": "U1", "channelId": "C1"}` (user re-joins)  
- **Expected**:  
  - The system should either **ignore** or **update** the existing entry.  
  - No duplicates in the data structures.

### **1.5 Solution Outline**  
1. **Parse event**: Read `userId` & `channelId` from the inbound message.  
2. **Call `addUserToChannel(userId, channelId, ws)`**: In your existing manager, 
store the user’s socket in `channelUsers[channelId]`.  
3. **Optional**: Broadcast a `"user_joined"` event to other members of the channel.  
4. **No duplication**: If the user’s socket is already in the set, do nothing special.

---

## 2) **Subproblem: “leave_channel” Event**  

### **2.1 Problem Statement**  
A user may close the chat or explicitly leave a channel. When they do, 
the system should remove that user from the channel’s active socket set.

### **2.2 Input/Output Format**  
- **Input (via WebSocket)**:
  ```json
  {
    "event": "leave_channel",
    "userId": "<string>",
    "channelId": "<string>"
  }
  ```
- **Process**: Remove the user’s socket from `channelUsers[channelId]`. 
If that user is no longer in any channel, remove them from `activeUsers` entirely.  
- **Output**: Possibly a confirmation or broadcast to others:  
  ```json
  { "event": "user_left", "channelId": "<string>", "userId": "<string>" }
  ```

### **2.3 Constraints**  
- If the user is **not** in that channel, ignore it gracefully.  
- If the user is in **multiple channels**, only remove them from the specified channel.  
- The user’s socket could still remain for **other** channels.

### **2.4 Test Cases**  
**Test Case A**  
- **Input**: `{"event": "leave_channel", "userId": "U1", "channelId": "C1"}`  
- **Process**:  
  - The user’s socket is removed from `channelUsers["C1"]`.  
  - If no other channel references that user’s socket, remove it from `activeUsers`.  
- **Expected Output**:  
  - Possibly `{"event": "user_left", "userId": "U1", "channelId": "C1"}` broadcast to others in channel.

**Test Case B**  
- **Input**: `{"event": "leave_channel", "userId": "U2", "channelId": "C2"}` (But user never joined C2).  
- **Expected**:  
  - The system checks `channelUsers["C2"]` and sees no socket for U2.  
  - No changes. No error—just a safe ignore.

### **2.5 Solution Outline**  
1. **Parse event**: Identify which user & channel.  
2. **Call `removeUser(userId, channelId, ws)`** from your manager.  
3. **Broadcast** an optional “user left” notification to other channel members.  
4. **Clean up** data structures—no duplicates or leftover empty sets.

---

## 3) **Subproblem: “send_message” Event**  

### **3.1 Problem Statement**  
A user sends a message to a channel, and everyone in that channel should receive it immediately.
 **You’ve mostly completed this** in your manager’s `broadcastToChannel` method, 
 but let’s restate it in a LeetCode style.

### **3.2 Input/Output Format**  
- **Input**:  
  ```json
  {
    "event": "send_message",
    "userId": "<string>",
    "channelId": "<string>",
    "content": "Hello world!"
  }
  ```
- **Process**:  
  1. Save the message in the DB (optional but typical).  
  2. Broadcast `"new_message"` to everyone in `channelId`.  

- **Output**:  
  - The server sends `"new_message"` event:
    ```json
    {
      "event": "new_message",
      "userId": "<string>",
      "channelId": "<string>",
      "content": "Hello world!",
      "timestamp": "...(server or DB timestamp)..."
    }
    ```

### **3.3 Constraints**  
- The user must **already be joined** to that channel. Otherwise, you can ignore or throw an error.  
- The message content can be any string, but typically we set **some length limit** 
(not enforced by your manager but good to note).

### **3.4 Test Cases**  
**Test Case A**  
```json
{
  "event": "send_message",
  "userId": "U1",
  "channelId": "C1",
  "content": "Hello!"
}
```
- **Expected**: Everyone in channel “C1” receives `"new_message"`, with `content = "Hello!"`.

**Test Case B**  
- If user “U2” is **not** in channel “C1” but tries to send a message there—do you want to
 **reject** it or **silently ignore** it? That’s your design decision.

### **3.5 Solution Outline**  
1. **Receive** `{"event": "send_message", userId, channelId, content}`.  
2. **(Optional)** Check if `userId` is in `channelUsers[channelId]`.  
3. **Save** the message to your DB.  
4. **Call** `broadcastToChannel(channelId, message)`.  
5. **All relevant sockets** receive `"new_message"` with the content + metadata.

---

## 4) **Subproblem: “user_typing” Event**  

### **4.1 Problem Statement**  
When a user is typing, you may want to **show** that status to others in real time. 
This is purely an event broadcast—no DB storage required.

### **4.2 Input/Output Format**  
- **Input**:
  ```json
  {
    "event": "user_typing",
    "userId": "U1",
    "channelId": "C1",
    "isTyping": true
  }
  ```
- **Process**: The server **broadcasts** a `"typing_status"` (or similar) event to the channel
 so others can show “U1 is typing...” in their UI.

- **Output**:
  ```json
  {
    "event": "typing_status",
    "userId": "U1",
    "channelId": "C1",
    "isTyping": true
  }
  ```

### **4.3 Constraints**  
- Typically ephemeral—no DB storage.  
- Only relevant if the user is **actually** in the channel.  

### **4.4 Test Cases**  
**Test Case A**  
```json
{
  "event": "user_typing",
  "userId": "U1",
  "channelId": "C1",
  "isTyping": true
}
```
- **Expected**: Everyone in channel “C1” receives:
  ```json
  {
    "event": "typing_status",
    "userId": "U1",
    "channelId": "C1",
    "isTyping": true
  }
  ```

**Test Case B**  
```json
{
  "event": "user_typing",
  "userId": "U1",
  "channelId": "C2",
  "isTyping": false
}
```
- **Expected**: Everyone in channel “C2” sees that user is no longer typing.

### **4.5 Solution Outline**  
1. **Parse** the event (`userId`, `channelId`, `isTyping`).  
2. **Check** if user belongs to that channel.  
3. **Broadcast** a new event (e.g. `"typing_status"`) to all sockets in that channel.

---

## **Where to Next?**
Now that you’ve outlined the main events, you can:
1. **Implement each event** in your WebSocket handler.  
2. **Leverage** your `ws_manager` to add/remove/broadcast as needed.  
3. **Test** each scenario with sample inputs (like the test cases above).  

**In short**, each of these events is like a **“mini-problem”** you can solve with the same pattern:

> **Parse** the inbound event → **Perform** the required logic 
 (DB or broadcast) → **Send** an outbound event to all relevant sockets.

This approach ensures you maintain a **clean, event-based architecture** for your real-time chat.
 * 
 * 
 * 2️⃣ list_channels
📝 Problem Statement
A user wants to see the list of available channels.

📩 Input
json
{
  "event": "list_channels",
  "userId": "U1"
}
📦 Expected Process
Retrieve all channel IDs from channelUsers.
 * 3️⃣ delete_channel
📝 Problem Statement
A user wants to delete a channel.
Only the creator of the channel should be allowed to do so.

📩 Input
json
Copy
Edit
{
  "event": "delete_channel",
  "userId": "U1",
  "channelId": "C1"
}
📦 Expected Process
Check if channelId exists.
Check if userId is authorized to delete it.
Remove the channel from channelUsers.
Notify all users in that channel.
📤 Expected Output
json
Copy
Edit
{
  "event": "channel_deleted",
  "channelId": "C1"
}
✅ Constraints
Only the channel creator (or an admin) can delete it.
📌 2) Message Events
4️⃣ send_message
📝 Problem Statement
A user sends a message in a channel.

📩 Input
json
Copy
Edit
{
  "event": "send_message",
  "userId": "U1",
  "channelId": "C1",
  "content": "Hello, world!"
}
📦 Expected Process
Verify that the user is in the channel.
Store the message (optional).
Broadcast the message to all channel members.
📤 Expected Output
json
Copy
Edit
{
  "event": "new_message",
  "userId": "U1",
  "channelId": "C1",
  "content": "Hello, world!",
  "timestamp": "2025-03-14T12:34:56Z"
}
✅ Constraints
Users can only send messages in channels they have joined.
Optionally store messages in a database.
5️⃣ edit_message
📝 Problem Statement
A user edits a previously sent message.

📩 Input
json
Copy
Edit
{
  "event": "edit_message",
  "userId": "U1",
  "channelId": "C1",
  "messageId": "M1",
  "newContent": "Hello, updated world!"
}
📦 Expected Process
Verify that the message exists.
Verify that userId is the sender.
Update the message.
Broadcast the updated message.
📤 Expected Output
json
Copy
Edit
{
  "event": "message_edited",
  "messageId": "M1",
  "channelId": "C1",
  "newContent": "Hello, updated world!"
}
✅ Constraints
Users can only edit their own messages.
6️⃣ delete_message
📝 Problem Statement
A user deletes a message.

📩 Input
json
Copy
Edit
{
  "event": "delete_message",
  "userId": "U1",
  "channelId": "C1",
  "messageId": "M1"
}
📦 Expected Process
Verify that the message exists.
Verify that userId is the sender or an admin.
Remove the message.
Notify all channel members.
📤 Expected Output
json
Copy
Edit
{
  "event": "message_deleted",
  "messageId": "M1",
  "channelId": "C1"
}
✅ Constraints
Users can only delete their own messages (unless they are admins).
📌 3) User Events
7️⃣ list_users
📝 Problem Statement
A user wants to see who is online.

📩 Input
json
Copy
Edit
{
  "event": "list_users"
}
📦 Expected Process
Retrieve all active users from activeUsers.
📤 Expected Output
json
Copy
Edit
{
  "event": "user_list",
  "users": ["U1", "U2", "U3"]
}
✅ Constraints
Users must be authenticated.
8️⃣ update_status (Online/Offline)
📝 Problem Statement
A user wants to update their presence status (e.g., online, away, offline).

📩 Input
json
Copy
Edit
{
  "event": "update_status",
  "userId": "U1",
  "status": "online"
}
📦 Expected Process
Update activeUsers[userId] with the new status.
Notify all users.
📤 Expected Output
json
Copy
Edit
{
  "event": "status_updated",
  "userId": "U1",
  "status": "online"
}
✅ Constraints
Status updates should be rate-limited.
9️⃣ disconnect
📝 Problem Statement
A user disconnects from WebSocket.

📩 Input
Triggered automatically when WebSocket closes.

📦 Expected Process
Remove user from activeUsers.
Remove them from all channelUsers sets.
Notify others that the user went offline.
📤 Expected Output
json
Copy
Edit
{
  "event": "user_disconnected",
  "userId": "U1"
}
✅ Constraints
Users should be auto-removed from channels on disconnect.


import React, { useState, useEffect } from "react";
import ws from "../websocket";

const Sidebar = () => {
    const [users, setUsers] = useState<string[]>([]);
    const [channels, setChannels] = useState<string[]>([]);

    useEffect(() => {
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.event === "user_list") setUsers(data.users);
            if (data.event === "channel_list") setChannels(data.channels);
        };
    }, []);

    return (
        <div className="sidebar">
            <h2>Channels</h2>
            <ul>
                {channels.map((channel, index) => (
                    <li key={index} className="channel">#{channel}</li>
                ))}
            </ul>

            <h2>Online Users</h2>
            <ul>
                {users.map((user, index) => (
                    <li key={index} className="user">{user}</li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;

 */