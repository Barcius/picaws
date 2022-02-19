const express = require("express");
const path = require('path');

const PORT = process.env.PORT || 3001;

const app = express();
const router = express.Router();

app.use(express.static(path.resolve(__dirname, './build')));

app.use('/api', router)

router.get("/test", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});