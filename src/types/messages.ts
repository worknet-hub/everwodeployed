
export interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  is_read: boolean;
  reply_to_id?: string;
  reply_to_message?: Message;
  reactions?: MessageReaction[];
  sender?: {
    full_name: string;
    avatar_url: string;
  };
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  user?: {
    full_name: string;
  };
}

export interface Conversation {
  partner_id: string;
  full_name: string;
  avatar_url: string;
  last_message_content: string;
  last_message_created_at: string;
<<<<<<< HEAD
  last_message_sender_id: string;
  last_message_read: boolean;
  current_user_id: string;
=======
>>>>>>> 600fc361db99d0afca5b5e0cecaa6e7bf7e65807
}
