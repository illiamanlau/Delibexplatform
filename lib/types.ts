// types.ts
export interface Message {
    roomId: string;
    name: string;
    email: string;
    content: string;
    timestamp: string;
  }
  
  export interface ChatRoomProps {
    roomId: string;
    title: string;
    description: string;
    userName: string;
    userEmail: string;
  }