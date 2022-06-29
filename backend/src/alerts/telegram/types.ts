export interface TgUpdate {
  update_id: number;
  message?: {
    chat: TgChat;
    text?: string;
  };
}

export type TgChat = TgPrivateChat | TgGroupChat;

interface TgPrivateChat {
  id: number;
  type: 'private';
  username: string;
}

interface TgGroupChat {
  id: number;
  type: 'group' | 'supergroup' | 'channel';
  title: string;
}
