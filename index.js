const fs = require("fs");
const { default: OpenAI } = require("openai");

const dotenv = require("dotenv");
dotenv.config();

const openaiApiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: openaiApiKey,
});

const readline = require("readline");
const similarity = require("compute-cosine-similarity");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function readMultiLineAsync(message) {
  return new Promise((resolve) => {
    let input = "";

    console.log(message);
    rl.prompt();

    rl.on("line", (line) => {
      if (line.toLowerCase() === "done") {
        rl.removeAllListeners("line");
        resolve(input.trim());
      } else {
        input += line + "\n";
        rl.prompt();
      }
    });
  });
}

function findSimilar(vector, embeddings, topK = 5) {
  const map = {};
  for (let i = 0; i < embeddings.length; i++) {
    const emb = embeddings[i];
    const cosineSimilarity = similarity(vector, emb.embedding);
    // console.log(emb.id, cosineSimilarity);
    map[emb.id] = cosineSimilarity;
  }

  // Find the topK most similar embeddings
  const sortedEmbeddings = Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK);

  return sortedEmbeddings;
}

const run = async () => {
  while (true) {
    const prompt = await readMultiLineAsync("Enter Prompt: ");

    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: prompt,
    });

    const emb = embedding.data[0].embedding;

    const embeddings = JSON.parse(
      fs.readFileSync("./out/embeddings.json", "utf8")
    );

    const top = findSimilar(emb, embeddings);

    // console.log(top);

    const chunks = JSON.parse(fs.readFileSync("./out/chunks.json", "utf8"));

    // console.log(chunks);

    // Find the chunks with same id as the top embeddings
    const transcripts = chunks.filter((c) => {
      // console.log(c.id);

      return top.map((t) => t[0]).includes(c.id);
    });

    console.log("Got closest matches: ", transcripts);

    const openAIPrompt = `
    CONTEXT FROM LECTURE TRANSCRIPTS:
    ${
      // matches.map((m) => m.metadata.text).join("\n\n")
      transcripts.map((t) => t.sentences).join("\n-\n")
    }

    PROMPT:
    ${prompt}

    `;

    const systemMessage =
      "You are a helpful asistant, helping me with questions. I will give you a question, think and show me your reasoning, then give me a single answer from the options and why.";

    console.log("Sending prompt to OpenAI...");

    const response = await openai.chat.completions.create({
      // model: "gpt-4o-mini",
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: openAIPrompt },
      ],
      temperature: 0.5,
    });

    // console.log(response);

    const aiRes = response.choices[0].message.content;

    console.log("AI RESPONSE: ", aiRes);

    console.log("------------------------------");
  }
};

run();
