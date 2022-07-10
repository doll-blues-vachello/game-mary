export interface MarRequest{
    meta: ReqMeta,
    request: ReqRequest,
    session: ReqSession,
    version: string
}

export interface ReqMeta{
    locale: string,
    timezone: string,
    interfaces: string[]
}

export interface ReqSession{
    session_id: string,
    user_id: string,
    skill_id: string,
    new: boolean,
    message_id: number,
    user: ReqUser,
    application: ReqApplication,
    // auth_token: ReqAuthToken
}

export interface ReqUser{
    user_id: string
}

export interface ReqApplication{
    application_id: string,
    application_type: 'mobile'|'speaker'|'VK'|'other',
}

export interface ReqRequest{
    command: string,
    original_utterance: string,
    type: 'SimpleUtterance' | 'ButtonPressed',
    payload: any,
    nlu: {tokens: string[]}
}

export interface MarResponse{
    response: RespResponse,
    session: RespSession,
    version: '1.0',
}

export interface RespResponse{
    text: string | string[],
    tts?: string,
    buttons?: RespButton[],
    end_session: boolean,
    // card: any,
    // commands: any
}

export interface RespButton{
    title: string,
    url?: string,
    payload?: any,
}

export interface RespSession{
    session_id: string,
    user_id: string,
    message_id: number,
}

export interface SessionData{
    nextMsgId: number,
    sessionIds: SessionIds,
    handler: MessageHandler
}

export interface HandlerResponse{
    text: string,
    buttons?: RespButton[]
}

export interface SessionIds{
    session_id: string,
    user_id: string,
}

export abstract class MessageHandler {
    abstract onMessage(req: ReqRequest): HandlerResponse;
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
}