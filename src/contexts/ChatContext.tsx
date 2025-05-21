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

    const getConvId = (uid: string) => {
        const ids = [user.uid, uid].sort();
        return `${ids[0]}_${ids[1]}`;
    };

    const sendMessage = async (otherUid: string, text: string) => {
        const convId = getConvId(otherUid);
        const msg: Message = { senderUid: user.uid, text, timestamp: Date.now() };
        await push(ref(db, `conversations/${convId}/messages`), msg);
    };

    const subscribe = (otherUid: string, callback: (msg: Message) => void) => {
        const convId = getConvId(otherUid);
        const msgsRef = query(ref(db, `conversations/${convId}/messages`), orderByChild('timestamp'));
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