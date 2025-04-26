export interface ChatMessage {
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

export interface ChatRequest {
    userMessage: string;
    botMessage: string;
}