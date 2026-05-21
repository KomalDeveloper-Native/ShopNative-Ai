import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { totalSize, width } from 'react-native-dimension';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import { colors } from '../com/theme/color';
import { products } from '../data/products';
import { sendAiChatMessage } from '../services/aiService';
import type { CartItem, Product } from '../types/productTypes';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

type AiAssistantProps = {
  cartItems: CartItem[];
  wishlistItems: Product[];
};

const quickPrompts = [
  'build my best cart',
  'recommend under 2000',
  'compare my wishlist',
  'is this a good deal',
  'delivery and payment help',
];

const formatPrice = (value: number) => `Rs ${value.toLocaleString('en-IN')}`;

const productLine = (product: Product) =>
  `${product.name} - ${formatPrice(product.price)}, ${product.discount}% off, ${product.rating.toFixed(1)} rating`;

const findBudget = (message: string) => {
  const match = message.match(/(?:under|below|less than|upto|up to)\s*(?:rs\.?\s*)?(\d+)/i);
  return match ? Number(match[1]) : undefined;
};

const pickProducts = (message: string, source: Product[]) => {
  const lowerMessage = message.toLowerCase();
  const budget = findBudget(message);
  const categoryMatches = source.filter(product =>
    lowerMessage.includes(product.category.toLowerCase()),
  );
  const searchBase = categoryMatches.length > 0 ? categoryMatches : source;

  return searchBase
    .filter(product => (budget ? product.price <= budget : true))
    .sort((a, b) => b.rating - a.rating || b.discount - a.discount)
    .slice(0, 3);
};

const createLocalReply = (
  message: string,
  cartItems: CartItem[],
  wishlistItems: Product[],
): string => {
  const lowerMessage = message.toLowerCase();
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const categories = [...new Set(cartItems.map(item => item.category))].join(', ');
  const savedCategories = [...new Set(wishlistItems.map(item => item.category))].join(', ');
  const budget = findBudget(message);
  const recommendations = pickProducts(message, products);

  if (lowerMessage.includes('best cart') || lowerMessage.includes('build my')) {
    const topPicks = pickProducts(message, products);
    const cartHint =
      cartItems.length > 0
        ? `Your cart is ${formatPrice(total)} across ${cartItems.length} item${cartItems.length === 1 ? '' : 's'}.`
        : 'Your cart is empty right now.';

    return `${cartHint} Strong picks to start with: ${topPicks.map(productLine).join('; ')}. Add the highest-rated item first, then use wishlist for anything you are comparing.`;
  }

  if (lowerMessage.includes('outfit')) {
    const outfitPicks = products
      .filter(product =>
        ['Fruits', 'Dairy', 'Snacks', 'Beverages', 'Bakery'].includes(
          product.category,
        ),
      )
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);

    return categories
      ? `Your cart already leans toward ${categories}. Add one breakfast staple, one snack, and one drink to make it more useful. Best matches: ${outfitPicks.map(productLine).join('; ')}.`
      : `Start with one fresh item, one dairy staple, and one snack. Try: ${outfitPicks.map(productLine).join('; ')}.`;
  }

  if (lowerMessage.includes('deal')) {
    const bestDiscount = [...cartItems, ...wishlistItems, ...products]
      .sort((a, b) => b.discount - a.discount || b.rating - a.rating)[0];

    return total > 0
      ? `Your cart is ${formatPrice(total)}. The strongest value signal is rating above 4.3 plus discount above 25%. Best deal I see now: ${productLine(bestDiscount)}.`
      : `A good deal here means high rating plus real discount. Start with: ${productLine(bestDiscount)}.`;
  }

  if (budget || lowerMessage.includes('recommend')) {
    const intro = budget
      ? `Best options under ${formatPrice(budget)}:`
      : 'Best options I would shortlist first:';

    return `${intro} ${recommendations.map(productLine).join('; ')}.`;
  }

  if (lowerMessage.includes('wishlist') || lowerMessage.includes('saved')) {
    return wishlistItems.length > 0
      ? `You have ${wishlistItems.length} saved item${wishlistItems.length === 1 ? '' : 's'}${savedCategories ? ` across ${savedCategories}` : ''}. Best saved pick: ${productLine([...wishlistItems].sort((a, b) => b.rating - a.rating)[0])}.`
      : 'Your wishlist is empty. Tap the heart on products you want to compare later, and I can rank them by price, discount, and rating.';
  }

  if (lowerMessage.includes('track') || lowerMessage.includes('delivery')) {
    return 'Open Profile, then My Orders to see delivery stage, estimated arrival time, payment status, and the delivery location saved at checkout.';
  }

  if (lowerMessage.includes('payment') || lowerMessage.includes('upi') || lowerMessage.includes('card')) {
    return 'Checkout supports COD, UPI, Card, Wallet, and Net Banking. For speed, use UPI or Wallet. For pay-on-delivery confidence, choose COD.';
  }

  if (lowerMessage.includes('location')) {
    return 'At checkout, tap Use current location to attach a delivery location label and coordinates before placing the order.';
  }

  return `I can rank products, build a cart, compare wishlist items, check deals, and help with checkout. Try one of these now: ${recommendations.map(productLine).join('; ')}.`;
};

const AiAssistant = ({ cartItems, wishlistItems }: AiAssistantProps) => {
  const [visible, setVisible] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hi, I can rank products, build a stronger cart, compare wishlist picks, and help with checkout.',
    },
  ]);

  const disabled = useMemo(() => input.trim().length === 0 || loading, [input, loading]);

  const sendMessage = async (text: string) => {
    const message = text.trim();

    if (!message || loading) {
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: message,
    };

    setMessages(current => [...current, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const result = await sendAiChatMessage(message, cartItems);
      setMessages(current => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: result.reply,
        },
      ]);
    } catch {
      setMessages(current => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: createLocalReply(message, cartItems, wishlistItems),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Pressable style={styles.floatingButton} onPress={() => setVisible(true)}>
        <LinearGradient
          colors={[colors.primaryColor, colors.accentColor]}
          style={styles.floatingGradient}>
          <FontAwesome name="robot" size={20} color={colors.white} />
        </LinearGradient>
      </Pressable>

      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.title}>AI Assistant</Text>
              <Pressable onPress={() => setVisible(false)} style={styles.closeButton}>
                <FontAwesome name="times" size={16} color={colors.textDark} />
              </Pressable>
            </View>

            <View style={styles.promptRow}>
              {quickPrompts.map(prompt => (
                <Pressable
                  key={prompt}
                  style={styles.promptChip}
                  onPress={() => sendMessage(prompt)}>
                  <Text style={styles.promptText}>{prompt}</Text>
                </Pressable>
              ))}
            </View>

            <FlatList
              data={messages}
              keyExtractor={item => item.id}
              style={styles.messages}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.bubble,
                    item.role === 'user' ? styles.userBubble : styles.aiBubble,
                  ]}>
                  <Text
                    style={[
                      styles.bubbleText,
                      item.role === 'user' ? styles.userText : styles.aiText,
                    ]}>
                    {item.text}
                  </Text>
                </View>
              )}
            />

            {loading && <ActivityIndicator color={colors.primaryColor} />}

            <View style={styles.inputRow}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Ask about your cart"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
              <Pressable
                disabled={disabled}
                onPress={() => sendMessage(input)}
                style={[styles.sendButton, disabled && styles.sendButtonDisabled]}>
                <FontAwesome name="paper-plane" size={14} color={colors.white} />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default AiAssistant;

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    right: 18,
    bottom: 86,
    zIndex: 20,
  },
  floatingGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlayLight,
    justifyContent: 'flex-end',
  },
  sheet: {
    height: '76%',
    backgroundColor: colors.background,
    borderTopLeftRadius: totalSize(3),
    borderTopRightRadius: totalSize(3),
    padding: totalSize(2),
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.textDark,
    fontSize: totalSize(2.2),
    fontWeight: '700',
  },
  closeButton: {
    padding: totalSize(1),
  },
  promptRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: totalSize(0.8),
    marginVertical: totalSize(1.5),
  },
  promptChip: {
    backgroundColor: colors.lightPurple,
    borderRadius: totalSize(2),
    paddingHorizontal: totalSize(1.2),
    paddingVertical: totalSize(0.7),
  },
  promptText: {
    color: colors.primaryColor,
    fontSize: totalSize(1.2),
    fontWeight: '800',
  },
  messages: {
    flex: 1,
  },
  bubble: {
    maxWidth: width(72),
    padding: totalSize(1.2),
    borderRadius: totalSize(1.5),
    marginBottom: totalSize(1),
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primaryColor,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
  },
  bubbleText: {
    fontSize: totalSize(1.4),
    lineHeight: totalSize(2),
  },
  userText: {
    color: colors.white,
  },
  aiText: {
    color: colors.textDark,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: totalSize(1),
    marginTop: totalSize(1),
  },
  input: {
    flex: 1,
    minHeight: totalSize(5),
    backgroundColor: colors.white,
    borderRadius: totalSize(1.4),
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: totalSize(1.2),
    color: colors.textDark,
  },
  sendButton: {
    width: totalSize(5),
    height: totalSize(5),
    borderRadius: totalSize(2.5),
    backgroundColor: colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.disabled,
  },
});
