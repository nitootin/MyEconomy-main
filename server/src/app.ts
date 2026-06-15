import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRoutes } from "./routes/authRoutes.js";
import { financeRoutes } from "./routes/financeRoutes.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/finance", financeRoutes);
app.use(errorHandler);
