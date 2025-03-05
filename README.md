## BIOL 1902 - Natural History Study RAG Model

This is a study RAG model for the BIOL 1902 Natural History course. It uses lectures from Mike Runtz Natural History lectures at Carleton University as context.

**_ This application was built as a proof-of-concept (dont mind the bad code haha) of the potential of RAG models for university courses to help students learn and study for exams. _**

This is not meant to be used for exams, but rather as a tool to help students learn and study for exams.

## How to Use

1. Clone the repository
2. Install the dependencies with `npm install`
3. Paste the given `out` file containing the embeddings and chunks into the root directory \*(see note below)
4. Create a `.env` file in the root directory with the following variables:

```
OPENAI_API_KEY=<your_openai_api_key>
```

5. Run the application with `node index.js`
6. Input your question, then press enter, and then write `done` and enter to send the question.

** Note: The `out` file is a JSON file containing the embeddings and chunks of the lectures. IT IS NOT INCLUDED IN THE REPOSITORY. This is because it is property of the instructor, and students enrolled in BIOL 1902.**
