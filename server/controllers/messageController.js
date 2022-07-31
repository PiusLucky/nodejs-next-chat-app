const Messages = require("../models/messageModel");
const userModel = require("../models/userModel");

//place in separate file
const unableToFetchTarget = (target) => {
  return `unable to fetch ${target}`;
};

const queryParamInvalid = (target) => {
  return `${target} is invalid`;
};

module.exports.getMessages = async (req, res, next) => {
  try {
    let senderIdCheck;
    const { offerId, senderId, receiverId } = req.body;
    try {
      senderIdCheck = await userModel.findById(senderId);
    } catch (err) {
      return res.status(400).json({
        message: unableToFetchTarget("senderId"),
        status: 400,
      });
    }

    if (!senderIdCheck) {
      return res.status(400).json({
        message: queryParamInvalid("senderId"),
        status: 400,
      });
    }

    try {
      receiverIdCheck = await userModel.findById(receiverId);
    } catch (err) {
      return res.status(400).json({
        message: unableToFetchTarget("receiverId"),
        status: 400,
      });
    }

    if (!receiverIdCheck) {
      return res.status(400).json({
        message: queryParamInvalid("receiverId"),
        status: 400,
      });
    }

    try {
      const messages = await Messages.find({ offerId }).sort({
        createdAt: 1,
      });
      const projectedMessages = messages.map((msg) => {
        return {
          fromSelf: msg.sender.toString() === senderId,
          message: msg?.message?.content,
        };
      });
      if (projectedMessages) {
        return res.status(200).json({
          message: projectedMessages,
          status: 200,
        });
      } else {
        return res.status(400).json({
          message: unableToFetchTarget("message"),
          status: 400,
        });
      }
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: err.message,
      });
    }
  } catch (ex) {
    next(ex);
  }
};

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, offerId } = req.body;
    const data = await Messages.create({
      ...(req.body.message && {
        message: {
          content: req.body.message,
        },
      }),
      ...(req.body.image && {
        image: {
          url: req.body.image,
        },
      }),
      users: [from, to],
      sender: from,
      receiver: to,
      offerId,
    });

    if (data)
      return res.status(200).json({ msg: "Message added successfully." });
    else
      return res
        .status(400)
        .json({ msg: "Failed to add message to the database" });
  } catch (ex) {
    next(ex);
  }
};
