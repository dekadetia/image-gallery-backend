const express = require("express");
const app = express();

const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.json("server running");
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
