# Resume Builder

A full-stack resume builder built on the MERN stack, letting users create, customize, download, and publicly share professional resumes — with AI-powered text enhancement to help polish their content.

## ✨ Features

- 📄 **PDF Export** — Download your resume as a clean, print-ready PDF
- 🔗 **Public Sharing** — Share a live link to your resume with anyone
- 🎨 **Multiple Templates** — Choose from a variety of resume templates/layouts
- 🤖 **AI Enhance** — One-click AI enhancement to improve wording and clarity of resume content
- 🖼️ **Image Handling** — Profile photos and images managed via [ImageKit.io](https://imagekit.io/)

## 🛠️ Tech Stack

| Layer      | Technology         |
|------------|--------------------|
| Frontend   | React (Vite)       |
| Backend    | Node.js, Express   |
| Database   | MongoDB            |
| Media/CDN  | ImageKit.io         |
| AI         | Google Gemini API (via OpenAI-compatible endpoint) |

## 📁 Project Structure

```
resume-builder/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── templates/
│   │   └── App.js
│   └── package.json
├── server/          # Express backend
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── config/
│   └── server.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local instance or MongoDB Atlas URI)
- ImageKit.io account (private key)
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-username>/resume-builder.git
   cd resume-builder
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**

   Create a `.env` file in the `server/` directory:
   ```env
   JWT_SECRET=your_jwt_secret
   MONGODB_URI=your_mongodb_connection_string
   IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
   OPENAI_API_KEY=your_gemini_api_key
   OPENAI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
   OPENAI_MODEL=gemini-2.0-flash
   ```
   > The AI enhance feature uses the Google Gemini API through its OpenAI-compatible endpoint, so it's configured with `OPENAI_*` style env vars — set `OPENAI_BASE_URL` to Gemini's compatibility endpoint and `OPENAI_MODEL` to the Gemini model you're using.

   Create a `.env` file in the `client/` directory:
   ```env
   VITE_BASE_URL=http://localhost:5000/api
   ```

5. **Run the app**

   In one terminal (backend):
   ```bash
   cd server
   npm run dev
   ```

   In another terminal (frontend):
   ```bash
   cd client
   npm run dev
   ```

   The app should now be running at `http://localhost:3000`.

## 📖 Usage

1. Sign up / log in
2. Pick a resume template
3. Fill in your details (experience, education, skills, etc.)
4. Click **Enhance with AI** on any text section to improve the wording
5. Download your resume as a PDF, or generate a public shareable link

## 🗺️ Roadmap

- [ ] Add more templates
- [ ] Resume analytics for public links (views count)
- [ ] Export to DOCX

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License.
