import React, { createContext, useContext } from 'react';
import { db } from '../config/firebase';
import { ref, push, onChildAdded, query, orderByChild, off } from 'firebase/database';
import { useAuth } from './AuthContext';

interface Message {
    senderUid: string;
    text: string;
    timestamp: number;
}

interface ChatContextType {
    sendMessage: (otherUid: string, text: string) => Promise<void>;
    subscribe: (otherUid: string, callback: (msg: Message) => void) => () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    if (!user) throw new Error('ChatProvider requires authenticated user');

    const getConvPath = (otherUid: string) => {
        const [a, b] = [user.uid, otherUid].sort();
        return `conversations/${a}/${b}/messages`;
    };

    const sendMessage = async (otherUid: string, text: string) => {
        const convPath = getConvPath(otherUid);
        const msg: Message = { senderUid: user.uid, text, timestamp: Date.now() };
        await push(ref(db, convPath), msg);
    };

    const subscribe = (otherUid: string, callback: (msg: Message) => void) => {
        const convPath = getConvPath(otherUid);
        const msgsRef = query(ref(db, convPath), orderByChild('timestamp'));
        const listener = onChildAdded(msgsRef, snap => callback(snap.val()));
        return () => off(msgsRef, 'child_added', listener);
    };

    return (
        <ChatContext.Provider value={{ sendMessage, subscribe }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error('useChat must be inside ChatProvider');
    return ctx;
}; 