import express, {Request, Response} from 'express';
import cors from 'cors';

const app = express();
const port = 3600;


interface MarRequest{
  meta: ReqMeta,
  request: ReqRequest,
  session: ReqSession,
  version: string
}

interface ReqMeta{
  locale: string,
  timezone: string,
  interfaces: string[]
}

interface ReqSession{
  session_id: string,
  user_id: string,
  skill_id: string,
  new: boolean,
  message_id: number,
  user: ReqUser,
  application: ReqApplication,
  // auth_token: ReqAuthToken
}

interface ReqUser{
  user_id: string
}

interface ReqApplication{
  application_id: string,
  application_type: 'mobile'|'speaker'|'VK'|'other',
}

interface ReqRequest{
  command: string,
  original_utterance: string,
  type: 'SimpleUtterance' | 'ButtonPressed',
  payload: any,
  nlu: {tokens: string[]}
}

interface MarResponse{
  response: RespResponse,
  session: RespSession,
  version: '1.0',
}

interface RespResponse{
  text: string | string[],
  tts?: string,
  buttons?: RespButton[],
  end_session: boolean,
  // card: any,
  // commands: any
}

interface RespButton{
  title: string,
  url?: string,
  payload?: any,
}

interface RespSession{
  session_id: string,
  user_id: string,
  message_id: number,
}

interface SessionData{
  nextMsgId: number,
  sessionIds: SessionIds,
  handler: MessageHandler
}

interface HandlerResponse{
  text: string,
  buttons?: RespButton[]
}

interface SessionIds{
  session_id: string,
  user_id: string,
}

abstract class MessageHandler {
  abstract onMessage(req: ReqRequest): HandlerResponse;
}

class SimpleHandler extends MessageHandler{
  i: number = 0
  onMessage(req: ReqRequest): HandlerResponse {
    return {text: `Hello, you typed: ${req.command}, this is your ${this.i++} message`};
  }
}


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


app.post("/marusya", (req, res) => {
  handler(req, res, ()=>new SimpleHandler())
})

app.post("/marusya/10", (req, res) => {
  handler(req, res, ()=>new OchkoHandler())
})

class OchkoHandler extends MessageHandler{
  gameOver: boolean = true
  score:number = 0
  

  checkCommand(req:ReqRequest, command: string): boolean{
    function normalize(s: string): string{
      return s.toLowerCase().replace('ё', 'е')
    }
    if(normalize(req.command).search(normalize(command)) != -1) return true
    if(typeof(req.payload) == 'string' && normalize(req.payload).search(normalize(command)) != -1) return true
    return false
  }

  buttons(commands: string[]): RespButton[]{
    return Array.from(commands.map<RespButton>((e)=>{return {title: e}}).values())
  }

  onMessage(req: ReqRequest): HandlerResponse {
    if(this.gameOver){
      if(!this.checkCommand(req, "старт")){
        return {text: "Скажите старт для начала игры", buttons:this.buttons(["Старт"])}
      }else {
        this.gameOver = false;
        this.score = 0;
      }
    }
    let respText = ""
    if(this.checkCommand(req, "ещё")){
      let n = Math.floor(Math.random()*(11 - 1)) + 1;
      respText += `Вам выпало ${n}\n`
      this.score += n;
    }
    if(this.checkCommand(req, "пас")){
      this.gameOver = true;
      return {text: "Вы победили со счетом " + this.score, buttons:this.buttons(["старт"])}
    }
    respText += `Ваш счёт = ${this.score}\n`
    if(this.score > 21){
      respText += "Вы проиграли\n"
      this.gameOver = true
      return {text: respText, buttons:this.buttons(["старт"])}
    }
    respText += "пас или ещё?\n"
    return {text: respText, buttons:this.buttons(["пас", "ещё"])}


  }


}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
