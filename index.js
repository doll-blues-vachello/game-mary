import express from "express";
import cors from "cors";

const app = express();
const port = 3600;

app.use(express.json({limit: 200000000}));
app.use(cors());

app.post("/mar", (req, res) => {
  console.log(req.body);
  res.status(200).json(req.body);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
