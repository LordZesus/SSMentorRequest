import MentorApp from "../../models/mentorAppModel";
import Request from "../../models/requestModel";
import Users from "../../models/userModel";
import {
  mentorAcceptText,
  mentorDenyText,
  trialAcceptText,
  trialDenyText,
} from "../datalist";
import dbConnect from "../mongodb";
import { sendDMToUser } from "./discordMethods";
import { getUserById, getUsersById, tryRegisterMentor } from "./userMethods";
import mongoose from "mongoose";
mongoose.set("strictQuery", false);
dbConnect();

export async function checkAppStatus(id) {
  const appStatus = MentorApp.findOne({ discordId: id });
  const mentor = await Users.findOne({ discordId: id });
  if (mentor?.isMentor) return { isMentor: true };
  if (await appStatus) {
    if (appStatus.processed) return { isDenied: true };
    return { isPending: true };
  }
  return {};
}

export async function checkPendingApp(id) {
  return (await MentorApp.findOne({ discordId: id })) && true;
}

export async function createApp(user, details) {
  const app = new MentorApp({
    ...details,
    discordId: user.sub,
    discordName: `${user.name}#${user.discriminator}`,
  });

  return await app.save();
}

export async function getAllApps(processed) {
  const query = processed !== undefined ? { processed } : {};
  const apps = await MentorApp.find(query)
    .select(" -updatedAt -__v")
    .populate("userLink comments.commenter")
    .lean();
  //This should be simpler, but at least it works atm
  const newApps = await Promise.all(
    apps.map(async (app) => {
      if (app.appStatus == "trial") {
        // console.log(app);
        app.requestCount = await Request.countDocuments({
          $and: [{ mentor: app.userLink?._id }],
        });
      }
      return {
        ...app,
        voted: await getUsersById(app.yay.concat(app.nay.concat(app.meh))),
      };
    })
  );

  return newApps;
}

export async function voteOnApp({ id, vote, reviewer }) {
  const app = await MentorApp.findOne({ discordId: id });

  app.yay = app.yay.filter((id) => id != reviewer);
  app.nay = app.nay.filter((id) => id != reviewer);
  app.meh = app.meh.filter((id) => id != reviewer);
  app[vote].push(reviewer);
  await app.save();
}

export async function deleteApp(id) {
  const response = await MentorApp.findOneAndDelete({ discordId: id });
  console.log(response);
}

export async function processApp(user, accepted) {
  const app = await MentorApp.findOne({ discordId: user.discordId });
  let message;
  switch (app.appStatus) {
    case "pending": {
      if (accepted) {
        const mentor = await tryRegisterMentor(user);
        app.userLink = mentor._id;
        app.appStatus = "trial";
        message = trialAcceptText;
        app.yay = [];
        app.nay = [];
        app.meh = [];
      } else {
        app.appStatus = "processed";
        message = trialDenyText;
      }
      break;
    }
    case "trial": {
      const mentor = await Users.findOne({ discordId: app.discordId });
      mentor.isTrial = false;
      mentor.isMentor = accepted;
      mentor.save();
      app.appStatus = "processed";
      message = accepted ? mentorAcceptText : mentorDenyText;
      break;
    }
    case "processed":
      if (process.env.ENV == "dev") app.appStatus = "pending";
      break;
  }
  app.save();
  sendDMToUser(user.discordId, message);
}

export async function commentApp({ commenterId, user, content }) {
  const app = await MentorApp.findOne({ discordId: user });
  const commenter = await getUserById(commenterId);
  app.comments.push({ commenter: commenter._id, content });
  await app.save();
}
