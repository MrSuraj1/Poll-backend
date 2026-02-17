const express = require("express");
const router = express.Router();
const Poll = require("../schema/polls");
const authMiddleware = require("../middleware/authmidle");
const user = require('../schema/user')
// ✅ GET ALL POLLS
router.get("/", async (req, res) => {
  try {
    const polls = await Poll.find();
    res.json(polls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ GET SINGLE POLL
router.get("/:id", async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    res.json(poll);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ CREATE POLL
router.post("/", async (req, res) => {
  try {
    const { question, options } = req.body;

    const newPoll = new Poll({
      question,
      options
    });

    await newPoll.save();

    res.json({ success: true, poll: newPoll });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ✅ VOTE
router.post("/:id/vote", authMiddleware, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const userId = req.user.id;

    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    // ✅ Fairness 1 — One vote per user
    if (poll.voters.includes(userId)) {
      return res.status(400).json({ message: "You already voted" });
    }

    // ✅ Fairness 2 — One vote per IP
    const voterIP =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    if (poll.ipAddresses.includes(voterIP)) {
      return res.status(400).json({
        message: "You already voted from this network"
      });
    }

    // Validate option
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ message: "Invalid option" });
    }

    // Update votes
    poll.options[optionIndex].votes += 1;
    poll.voters.push(userId);
    poll.ipAddresses.push(voterIP);

    await poll.save();

    const io = req.app.get("io");
    io.emit("pollUpdated", poll);

    res.json({ success: true, poll });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// DELETE POLL
router.delete("/:id", async (req, res) => {
  try {
    await Poll.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
