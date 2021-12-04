import express, { Request, Response } from "express";
import queue from "./src/queue";

const app = express();
app.use(express.text());

const q = queue();

const PORT = 8000;

app.post("/produce", (req: Request, res: Response): void => {
  const item = q.produce(req.body);
  res.send(item);
});

app.post("/consume", (req: Request, res: Response): void => {
  const item = q.consume();
  res.send(item || {});
});

app.post("/confirm", (req: Request, res: Response): void => {
  const item = q.confirm(req.body);
  res.send(item || {});
});

const server = app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});

export { app, q as queue, server };
