# PitchIn AI 

> **AI-driven Startup Pitch Validation**  
> Upload your deck, practice investor Q&A, and validate market fit — all powered by AI.

---

## Table of Contents

1. [Project Overview](#project-overview)  
2. [Features](#features)  
3. [Tech Stack](#tech-stack)  
4. [Directory Layout](#directory-layout)  
5. [Hosted Frontend Prototype](#hosted-frontend-prototype)  

---

## Project Overview

PitchIn AI is a web application that helps startup founders:

- **Upload** pitch decks (PDF, PPTX) for instant AI feedback  
- **Simulate** investor Q&A tailored to your domain & stage  
- **Validate** market fit via custom metrics & get actionable advice  

Admins and Investors have role-specific dashboards; founders see history of all their analyses.

---

## Features

- **AI-Powered Pitch Analysis**: Structure, Market Fit, and Readiness feedback.  
- **Investor Q&A Simulator**: Generates 10 targeted questions, plus AI review of your answers.  
- **Market Validation**: Calculates success likelihood score (0–100%) and recommendations.  
- **History & Reports**: View past analyses; export PDF/CSV.  
- **Role Segmentation**: Founder, Investor, Admin views.  
- **Basic Data Protection**: JWT auth, scoped API routes, secure headers via Helmet.

---

## Tech Stack

- **Frontend**: React, React-Bootstrap, React Router  
- **Backend**: Node.js, Express.js, Mongoose (MongoDB)  
- **AI**: OpenAI (via OpenRouter)  
- **File Upload**: Multer (PDF/PPTX parsing)  
- **Hosting**: Vercel (client), Render (server)

---

## Directory Layout

WebApp-project/
├── client/ # React frontend
│ ├── public/ # Static HTML, icons
│ └── src/
│ ├── components/ # React components by feature
│ ├── styles/ # CSS/Modules
│ ├── App.js # Entry point & routing
│ └── index.js # ReactDOM render
├── server/ # Express API
│ ├── middleware/ # Auth & admin guards
│ ├── models/ # Mongoose schemas
│ ├── routes/ # Endpoint handlers
│ └── server.js # App bootstrap

## Hosted Frontend Prototype:
[Click to view](https://web-app-project-umber.vercel.app/)
- Sign Up to view the whole website. 
