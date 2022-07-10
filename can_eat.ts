// import {}

// import {HandlerResponse, MessageHandler, ReqRequest} from "./index";

import {HandlerResponse, MessageHandler, ReqRequest} from "./types";

const tasty = [
    "🍇 Виноград",
"🍈 Дыня",
"🍉 Арбуз",
"🍊 Апельсин",
"🍋 Лимон",
"🍌 Банан",
"🍍 Ананас",
"🥭 Манго",
"🍎 Яблоко",
]
const not_tasty = [
    "🚗 Машину",
    "💩 Какашку",
    "🏘️ Дом",
    "⏰ Часы",
    "👨 Человека"
]


export class EatHandler extends MessageHandler{
    gameOver: boolean = true
    score:number = 0
    wasEadible: boolean

    onMessage(req: ReqRequest): HandlerResponse {
        console.log("start", this.wasEadible)
        let firstTurn = false
        if(this.gameOver){
            if(!this.checkCommand(req, "старт")){
                return {text: "Скажите старт для начала игры", buttons:this.buttons(["Старт"])}
            }else {
                this.gameOver = false;
                this.score = 0;
                firstTurn = true
            }
        }
        let respText = ""
        let saidEadible: boolean
        console.log("before checks", this.wasEadible)
        if(this.checkCommand(req, "несъедобное") || this.checkCommand(req, "нет")){
            saidEadible = false
        }
        else if(this.checkCommand(req, "съедобное") || this.checkCommand(req, "да")){
            saidEadible = true
        }else if(!firstTurn){
            return {text: "Я вас не поняла", buttons: this.buttons(["съедобное", "несъедобное"])}
        }
        console.log("after checks:", this.wasEadible)
        if(!firstTurn){
            if(saidEadible === this.wasEadible){
                respText += "Вы угадали\n"
                this.score += 1
            }else {
                respText += "Вы не угадали\n"
                this.score = 0
            }
            respText += `Ваш счёт = ${this.score}\n`
        }

        this.wasEadible = Math.random() > 0.5
        let arr = this.wasEadible ? tasty : not_tasty
        let item = arr[Math.floor(Math.random()*arr.length)];

        respText += `Я кидаю Вам  ${item}\n`
        respText += "Съедобное или несъедобное?\n"
        console.log(this.wasEadible, item)
        return {text: respText, buttons:this.buttons(["съедобное", "несъедобное"])}
    }
}