const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

const handleEvent = (type, data) => {
  if (type === "PostCreated") {
    const { id, title } = data;

    posts[id] = { id, title, comment: [] };
  }

  if (type === "CommentCreated") {
    const { id, content, postId, status } = data;

    const post = posts[postId];

    post.comment.push({ id, content, status });
  }

  if (type === "CommentUpdated") {
    const { id, content, postId, status } = data;

    const post = posts[postId];
    const comment = post.comment.find((comment) => {
      return comment.id === id;
    });

    comment.status = status;
    comment.content = content;
  }
};

app.get("/posts", (req, res) => {
  console.log("Get Posts :- ", posts);
  res.send(posts);
});

app.post("/events", (req, res) => {
  const { type, data } = req.body;

  console.log(type);
  handleEvent(type, data);

  res.send({});
});

app.listen(4002, async () => {
  console.log("Listening on 4002: Query Service ");

  try {
    const res = await axios.get("http://localhost:4005/events");

    for (let event of res.data) {
      handleEvent(event.type, event.data);
    }
  } catch (err) {
    console.log("Err: -", err);
  }
});
