// import {}

// import {HandlerResponse, MessageHandler, ReqRequest} from "./index";

import {HandlerResponse, MessageHandler, ReqRequest} from "./types";

const width = 8
const height = 8

interface Point{
    x: number,
    y: number
}


export class SnakeHandler extends MessageHandler{
    gameOver: boolean = true
    snake: Point[]
    foodPosition: Point

    placeFood(){
        while (true){
            let x = Math.floor(Math.random() * width)
            let y = Math.floor(Math.random() * height)
            let isOk = true
            for(let point of this.snake){
                if(point.x == x && point.y == y){
                    isOk = false
                    break
                }
            }
            if(isOk){
                this.foodPosition = {x, y}
                break
            }
        }
    }

    checkCollision(p: Point):boolean{
        for(let point of this.snake){
            if(point.x == p.x && point.y == p.y){
                return true
            }
        }
        return false
    }

    onMessage(req: ReqRequest): HandlerResponse {
        let firstTurn = false
        if(this.gameOver){
            if(!this.checkCommand(req, "старт")){
                return {text: "Скажите старт для начала игры", buttons:this.buttons(["Старт"])}
            }else {
                this.gameOver = false;
                firstTurn = true
                this.snake = [{x:4, y:4}]
                this.placeFood()

            }
        }
        let respText = ""
        let saidEadible: boolean
        let newPos: Point
        let head = this.snake[0]
        if(this.checkCommand(req, "верх")){
            newPos = {x:head.x, y:head.y-1}
        }else if(this.checkCommand(req, "низ")){
            newPos = {x:head.x, y:head.y+1}
        }else if(this.checkCommand(req, "лев")){
            newPos = {x:head.x-1, y:head.y}
        }else if(this.checkCommand(req, "прав")) {
            newPos = {x:head.x+1, y:head.y}
        }else if(!firstTurn){
            return {text: "Я вас не поняла", buttons:this.buttons(["Вверх", "Вниз", "Влево", "Вправо"])}
        }

        if(!firstTurn){
            if(newPos.y < 0 || newPos.y >= height || newPos.x < 0 || newPos.x >= width){
                this.gameOver = true
            }else if(this.checkCollision(newPos)){
                this.gameOver = true
            }else {
                this.snake = [newPos].concat(this.snake)
                if(newPos.y == this.foodPosition.y && newPos.x == this.foodPosition.x){
                    this.placeFood()
                }else{
                    this.snake.pop()
                }
            }
        }

        for(let y = 0; y < height; y++){
            for(let x = 0; x < width; x++){
                if(this.checkCollision({x, y}))respText += '🟡'
                else if(y == this.foodPosition.y && x == this.foodPosition.x){
                    respText += '🔴'
                }
                else respText += '🟤'
            }
            respText += '\n'
        }

        if(this.gameOver){
            respText += "Вы проиграли\n"
            return {text: respText, buttons:this.buttons(["Старт"])}
        }

        respText += "Вверх, вниз, влево или вправо?\n"

        return {text: respText, buttons:this.buttons(["Вверх", "Вниз", "Влево", "Вправо"])}
    }
}