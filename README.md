# React Native Real-Time Chat App

A full-stack, real-time chat application built with React Native for the frontend and Node.js/Express for the backend. The application features live messaging across multiple devices (web, Android, iOS) using WebSockets for an instant, responsive user experience. 

## 🛠️ Technology Stack

### Frontend (`chat-frontend`)
*   **React Native** & **Expo**: A robust framework to build native apps for Android, iOS, and Web using React.
*   **Expo Router**: Powerful file-based routing architecture for seamless navigation out of the box.
*   **React Navigation**: Native routing and navigation handling for native-feel tabs, stacks, and links.
*   **React Native Reanimated & Gesture Handler**: Next-generation animation and interaction capabilities.
*   **Expo UI & Feedback**: Utilities like **Expo Image**, **Expo Blur**, **Expo Linear Gradient**, and **Expo Haptics** for advanced visuals and tactile feedback.
*   **Socket.IO Client**: The client-side WebSocket library that manages the real-time, bi-directional communication channel with the server.
*   **TypeScript**: Strongly typed superset of JavaScript that captures errors at compile-time instead of runtime.

### Backend (`backend`)
*   **Node.js**: Asynchronous event-driven JavaScript runtime environment executing the server code.
*   **Express.js**: Fast, unopinionated, minimalist web framework for Node.js used to set up the HTTP server.
*   **Socket.IO**: Real-time unified communication engine that natively handles WebSockets and provides graceful fallbacks for robust messaging.
*   **CORS (Cross-Origin Resource Sharing)**: Middleware built into Express to restrict or allow HTTP/WebSocket requests from different domains natively.

## 🚀 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) installed
*   [Expo Go app](https://expo.dev/go) installed on your mobile phone (optional, for testing on a physical device)
*   A package manager like `npm`

### 1. Running the Backend Server
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies (if you haven't already):
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   node server.js
   ```
   *The server will start running locally on `http://localhost:3000`.*

### 2. Running the Frontend Application
1. Open a **new** terminal tab or window.
2. Navigate to the frontend directory:
   ```bash
   cd chat-frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the Expo development server:
   ```bash
   npm start
   ```

### 3. Using the App:
*   **Web Browser**: Press `w` in your frontend terminal to open the chat interface in your computer's browser.
*   **Android Device**: Open the **Expo Go** app on your phone, then scan the QR code printed in the frontend terminal using the app or your camera. Ensure your phone and PC are on the same Wi-Fi.

## 🤝 Contributing
Feel free to open an issue or submit a pull request if you want to improve this application or add new features!
