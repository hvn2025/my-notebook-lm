import cors from "cors";
import express from "express";

const app = express();
const port = 4000;

app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);

app.get("/health", (_request, response) => {
  response.json({ message: "Backend is alive" });
});

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
