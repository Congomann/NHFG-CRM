import { db } from '../db';
import { User, UserRole, Message } from '../../types';

export const sendMessage = (currentUser: User, { receiverId, text }: { receiverId: number, text: string }) => {
    const newMessage = db.createRecord('messages', {
        senderId: currentUser.id,
        receiverId,
        text,
        timestamp: new Date().toISOString(),
        status: 'active',
        source: 'internal',
    });

    // Create a notification for the receiver
    db.createRecord('notifications', {
        userId: receiverId,
        message: `You have a new message from ${currentUser.name}.`,
        timestamp: new Date().toISOString(),
        isRead: false,
        link: `messages/${currentUser.id}`
    });

    return newMessage;
};

export const editMessage = (currentUser: User, messageId: number, { text }: { text: string }) => {
    const message = (db.getAll('messages') as Message[]).find(m => m.id === messageId);
    if (!message) throw { status: 404, message: 'Message not found.' };
    if (message.senderId !== currentUser.id) throw { status: 403, message: 'You can only edit your own messages.' };

    const messageTime = new Date(message.timestamp).getTime();
    const currentTime = new Date().getTime();
    if ((currentTime - messageTime) > 2 * 60 * 1000) { // 2 minute edit window
        throw { status: 403, message: 'Edit time window has expired.' };
    }

    // FIX: Explicitly provide the generic type to ensure type safety.
    return db.updateRecord<Message>('messages', messageId, { text, edited: true });
};

export const trashMessage = (currentUser: User, messageId: number) => {
    const message = (db.getAll('messages') as Message[]).find(m => m.id === messageId);
    if (!message) throw { status: 404, message: 'Message not found.' };

    const isSender = message.senderId === currentUser.id;
    const isReceiver = message.receiverId === currentUser.id;
    const isAdmin = currentUser.role === UserRole.ADMIN;
    
    // Check general permission first
    if (!isSender && !isReceiver && !isAdmin) {
        throw { status: 403, message: 'You are not authorized to perform this action.' };
    }

    const messageTime = new Date(message.timestamp).getTime();
    const currentTime = new Date().getTime();
    const isRecent = (currentTime - messageTime) < 24 * 60 * 60 * 1000; // 24-hour window for "unsend"

    // "Unsend" logic: If the sender deletes a recent message, it's deleted for everyone.
    if (isSender && isRecent) {
        const success = db.deleteRecord('messages', messageId);
        if (!success) {
            throw { status: 500, message: 'Failed to delete message.' };
        }
        return { success, action: 'deleted_for_everyone' };
    }

    // "Delete for me" logic for all other cases (receiver deletes, sender deletes old message, admin deletes)
    return db.updateRecord<Message>('messages', messageId, { 
        status: 'trashed', 
        deletedTimestamp: new Date().toISOString(),
        deletedBy: currentUser.id 
    });
};

export const restoreMessage = (currentUser: User, messageId: number) => {
    const message = (db.getAll('messages') as Message[]).find(m => m.id === messageId);
    if (!message) throw { status: 404, message: 'Message not found.' };

    if (message.deletedBy !== currentUser.id && currentUser.role !== UserRole.ADMIN) {
         throw { status: 403, message: 'You are not authorized to restore this message.' };
    }

    // FIX: Explicitly provide the generic type to ensure type safety.
    return db.updateRecord<Message>('messages', messageId, { 
        status: 'active', 
        deletedTimestamp: undefined, 
        deletedBy: undefined 
    });
};

export const permanentlyDeleteMessage = (currentUser: User, messageId: number) => {
    if (currentUser.role !== UserRole.ADMIN) {
        throw { status: 403, message: 'Only administrators can permanently delete messages.' };
    }
    const success = db.deleteRecord('messages', messageId);
    if (!success) {
        throw { status: 404, message: 'Message not found for permanent deletion.' };
    }
    return { success };
};