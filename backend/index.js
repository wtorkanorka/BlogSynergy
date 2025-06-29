import express from "express";
import router from "./router.js";
import { createClient } from "@supabase/supabase-js";

const PORT = 5000;

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  // Разрешаем запросы с любого источника (можно заменить на конкретный, например, 'http://localhost:5173')
  res.header("Access-Control-Allow-Origin", "*");

  // Разрешаем необходимые HTTP-методы (включая DELETE)
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  // Разрешаем нужные заголовки (добавляем Authorization, если используется)
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  // Если это предзапрос (OPTIONS) — сразу отвечаем успехом
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next(); // Пропускаем запрос дальше
});

app.use(router);

async function startApp() {
  try {
    app.listen(PORT, () => {
      console.log("server listening on port:" + PORT);
    });
  } catch (e) {
    console.log(e);
  }
}
startApp();
