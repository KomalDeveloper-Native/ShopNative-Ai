import api from '../com/utils/Auth/api';
import type { CartItem } from '../types/productTypes';

export type AiChatResponse = {
  reply: string;
};

export const sendAiChatMessage = async (
  message: string,
  cartItems: CartItem[],
): Promise<AiChatResponse> => {
  const response = await api.post<AiChatResponse>('/ai/chat', {
    message,
    cartItems,
  });

  return response.data;
};
