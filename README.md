# CS 451R Team 15 Capstone Project – Brokerage Web App

## Team Members
- Ryan Phillips
- Mike Minor
- Nguyen Quy Toan (Tom)
- Dylan Johnson
---

## Project Overview
This project is a **brokerage web application** featuring **LLM recomendation services**.  
Users can log in securely, view holdings, deposit and withdrdaw, make transactions, and interact with an llm to get in depth market recommendations and portfolio analysis.  
---

## Tech Stack
- **Frontend:** React, ViteJS, JavaScript
- **Styling:** CSS / Inline Styles  
- **Backend:** Supbase
- **LLM:** Ollama

---

## Features
- Secure registration and login pages with supabase authentication
- Forgotten/Reset password with one time code pipeline
- User holdings/porfolio dashboard page
- Deposit and withdraw to user accounts on transactions page
- Buy and sell stocks/etfs on the transaction page
- LLM portfolio recommendations page
- LLM market analysis and recommendation page
- Prfile page for viwing all account details and exporting transactions history to csv


---

## Stretch Goals
- Export user transactions history to csv
- LLM Porfolio Analysis + Recommendations
- LLM Market Analysis + Recommendations

---

## Databse Schema + Setup (Supabase)
- The databse schema creation and sql setup scripts are provided in the SchemaAndSetup.sql file
- Paste this file directly into supabase sql editor and run
- All code that directly makes calls to supabse is in src/authContext.js


---

## 🛠 Setup Instructions

### Clone the repository
```bash
git clone https://github.com/RyanPhillipsUMKC/CS451R-Team15.git 
```

### Navigate into the project folder
```bash
cd CS451R-Team15
```

### Install dependencies  
```bash
npm install
```

### Run the development server  
```bash
npm run dev
```

### Open the application  
Open your browser and go to:  
```bash
http://localhost:5173
```

---

## 🛠 Supabase Setup Instructions

### Setp Supabase Project on Supabase Website

### Paste Schema.sql file into the sql editor and create all tables.
