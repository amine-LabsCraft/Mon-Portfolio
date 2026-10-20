# 🤖 Customer Support FAQ Chatbot (RAG)

<p align="center">

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)
![LangChain](https://img.shields.io/badge/LangChain-Framework-green)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--3.5-black)
![FAISS](https://img.shields.io/badge/FAISS-Vector%20Database-orange)
![License](https://img.shields.io/badge/License-MIT-red)

</p>

> A Retrieval-Augmented Generation (RAG) chatbot built with **LangChain**, **OpenAI**, **FAISS**, and **Hugging Face Datasets** to answer customer support questions using semantic search.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#️-architecture)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Technologies](#️-technologies)
- [Pipeline](#-pipeline)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Usage](#️-usage)
- [Example](#-example)
- [How It Works](#-how-it-works)
- [Future Improvements](#-future-improvements)
- [License](#-license)
- [Author](#-author)

---

## 📖 Overview

This project demonstrates how to build a conversational AI assistant powered by the Retrieval-Augmented Generation (RAG) architecture.

Instead of relying only on the knowledge stored inside the language model, the chatbot first retrieves the most relevant FAQ documents from a vector database before generating a final response. This significantly improves answer accuracy while reducing hallucinations.

---

## 🏗️ Architecture

<p align="center">
<img src="customer_RAG.png" alt="Customer Support RAG Architecture" width="90%">
</p>

The diagram above illustrates the complete RAG pipeline implemented in this project — from FAQ ingestion to answer generation.

---

## ✨ Features

- Load FAQ dataset from Hugging Face
- Convert data into LangChain Documents
- Generate semantic embeddings using OpenAI
- Store embeddings in FAISS
- Perform semantic similarity search
- Retrieve the Top-K relevant documents
- Generate contextual responses using GPT-3.5 Turbo
- Maintain conversation history

---

## 📂 Project Structure

```text
RAG_customer_support/
│
├── customer_RAG.png
├── cust_supp.py
├── vector_db/
├── .env
├── requirements.txt
└── README.md
```

---

## ⚙️ Technologies

- Python
- LangChain
- OpenAI API
- FAISS
- Hugging Face Datasets
- python-dotenv

---

## 📊 Pipeline

<p align="center">
<img src="FLOW.png" alt="RAG Pipeline Flow" width="90%">
</p>

```text
HuggingFace Dataset
        │
        ▼
Document Preparation
        │
        ▼
OpenAI Embeddings
        │
        ▼
FAISS Vector Database
        │
        ▼
Retriever (Top-K)
        │
        ▼
GPT-3.5 Turbo
        │
        ▼
Answer Generation
```

---

## 🚀 Installation

**1. Clone the repository**

```bash
git clone https://github.com/amine-LabsCraft/RAG_customer_support.git
cd RAG_customer_support
```

**2. Create a virtual environment**

```bash
python -m venv venv
```

**3. Activate it**

Windows:
```bash
venv\Scripts\activate
```

Linux / macOS:
```bash
source venv/bin/activate
```

**4. Install dependencies**

```bash
pip install -r requirements.txt
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```env
OPENAI_API_KEY=your_openai_api_key
```

---

## ▶️ Usage

Run the chatbot:

```bash
python cust_supp.py
```

### Example

```text
You : How can I pay?
Bot :
You can pay using Visa, Mastercard, PayPal,
or any other supported payment method.
```

---

## 🧠 How It Works

1. Load the FAQ dataset.
2. Convert each FAQ into a LangChain `Document`.
3. Generate embeddings using OpenAI.
4. Store embeddings in FAISS.
5. Retrieve the Top-K most relevant documents.
6. Build the prompt with retrieved context.
7. GPT-3.5 Turbo generates the answer.
8. Store the conversation history for contextual interactions.

---

## 🚧 Future Improvements

- [ ] Streamlit Web Interface
- [ ] FastAPI REST API
- [ ] Docker Support
- [ ] ChromaDB Integration
- [ ] Pinecone Integration
- [ ] Hybrid Search
- [ ] Re-ranking Models
- [ ] Source Citation
- [ ] GPT-4.1 / GPT-5 Support
- [ ] Multi-user Sessions

---

## 📄 License

This project is distributed under the **MIT License**.

---

<div align="center">

**Customer Support FAQ Chatbot (RAG)**
*by* **Amine Ait Ali** · Data & AI Engineer

[![GitHub](https://img.shields.io/badge/GitHub-amine--LabsCraft-181717?style=flat&logo=github)](https://github.com/amine-LabsCraft)
[![Portfolio](https://img.shields.io/badge/Portfolio-amine--aitali--5752.netlify.app-00C7B7?style=flat&logo=netlify&logoColor=white)](https://amine-aitali-5752.netlify.app/)

If you found this repository useful, please consider giving it a ⭐ on GitHub.

</div>
