import express, {Request, Response} from 'express';
import cors from 'cors';
import {OchkoHandler} from "./ochko";
import {MarRequest, MarResponse, MessageHandler, ReqRequest, SessionData} from "./types";
import {EatHandler} from "./can_eat";
import {SnakeHandler} from "./snake";

const app = express();
const port = 3600;




app.use(express.json({limit: 200000000}));
app.use(cors());

const sessions = new Map<string, SessionData>();

function handler(req: Request, res: Response, handlerFactory: ()=>MessageHandler){
  // console.log(req.body);
  let mreq = req.body as MarRequest
  let sessId = mreq.session.user_id + mreq.session.session_id
  if(!sessions.has(sessId)){
    console.log("New session")
    sessions.set(sessId, {nextMsgId: 1, handler: handlerFactory(), sessionIds:{session_id: mreq.session.session_id, user_id: mreq.session.user_id}})
  }
  let sessionData = sessions.get(sessId)
  let resp = sessionData.handler.onMessage(mreq.request)

  let response: MarResponse = {response: {text:resp.text, buttons: resp.buttons, end_session:false},
    version:"1.0",
    session: {session_id:mreq.session.session_id, user_id:mreq.session.user_id, message_id: mreq.session.message_id}
  }
  res.status(200).json(response);
}



app.post("/marusya/10", (req, res) => {
  handler(req, res, ()=>new OchkoHandler())
})

app.post("/marusya/20", (req, res) => {
  handler(req, res, ()=>new EatHandler())
})

app.post("/marusya/30", (req, res) => {
  handler(req, res, ()=>new SnakeHandler())
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
