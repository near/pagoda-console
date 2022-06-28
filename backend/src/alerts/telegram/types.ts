export interface TgUpdate {
  update_id: number;
  message?: {
    chat: {
      id: number;
    };
    text?: string;
  };
}
