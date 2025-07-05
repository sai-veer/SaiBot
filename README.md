# 🤖 SaiBot

**SaiBot** is a modern AI-powered chatbot web application that offers users an interactive and personalized chat experience. It features user authentication, custom avatars (upload your own picture or choose an emoji), theme selection (dark/light mode), multi-tab chat sessions, and smooth typing animations.

---

## 🚀 Features

* **Register & Login:** Secure user authentication with encrypted passwords.
* **Custom Avatars:** Upload your own profile picture or choose an emoji avatar.
* **Personalized Themes:** Dark mode and light mode with persistent theme storage.
* **Multi-Session Chats:** Create, rename, and manage multiple chat sessions.
* **Animated Typing Effects:** Smooth typing animations with typing indicators.
* **Responsive Design:** Clean, modern, and fully responsive UI.

---

## 🛠 Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js, MongoDB, JWT Authentication
- **Styling:** Custom CSS with animations and responsive design
- **APIs:** Integrate any AI chat API (OpenAI, Groq, etc.)
---

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/SaiBot.git
   cd SaiBot
2. **Set up backend:**
   ```bash
   cd backend
   npm install
3. **Create .env inside backend:**
   ```
   MONGO_URI=your_mongodb_uri
   PORT=5000
   JWT_SECRET=your_jwt_secret
   GROQ_API_KEY=your_ai_api_key
   ```
5. **Start backend server:**
   ```bash
   node server.js
6. **Frontend Setup:**
   * Open the frontend folder in your browser or deploy using Netlify, Vercel, etc.

## 📸 Screenshots

**Index Page**
![Index Page](https://github.com/user-attachments/assets/ce0bc745-fbf1-4684-a534-f4dd1588bf13)
**Register Page**
![Register Page](https://github.com/user-attachments/assets/c7b53aa8-c26a-4b2b-89e2-411a0d354d37)
**Login Page**
![Login Page](https://github.com/user-attachments/assets/f982c7c4-7d16-4cc2-8189-8516994e4da6)
**User Page**
![User Page](https://github.com/user-attachments/assets/13341988-9201-4132-919c-3999d75fe3b6)

---

## 🚀 Deployment

### Backend (Render)
1. Deploy the `backend` folder on [Render](https://render.com/).
2. Add the following environment variables in Render:
   - `MONGO_URI` = Your MongoDB Atlas connection string
   - `PORT` = 5000 (or leave blank to use Render's default)
   - `JWT_SECRET` = Your secure JWT secret key
   - `GROQ_API_KEY` = Your Groq AI API key (if using AI features)
3. Copy the Render backend URL (e.g., `https://your-backend.onrender.com`).

### Frontend (Vercel or Netlify)
1. Deploy the frontend files (`intro.html`, `login.html`, `register.html`, `userpage.html`, CSS, JS) on [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/).
2. Make sure the frontend uses the correct backend URL in the fetch calls (update to your Render URL).

### Optional:
- Add a custom domain if required.
- To set the landing page, rename your desired homepage as `index.html` before deployment.

✅ Live Demo: [https://saibot.vercel.app/](https://saibot.vercel.app/)

---

## 💡 Future Improvements

- **Chat history export**
- **AI model selection**
- **Voice-to-text integration**

---
