// import {}

// import {HandlerResponse, MessageHandler, ReqRequest} from "./index";

import {HandlerResponse, MessageHandler, ReqRequest} from "./types";

export class OchkoHandler extends MessageHandler{
    gameOver: boolean = true
    score:number = 0

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