import { db } from '../db';
import { User, UserRole } from '../../types';

export const updateMyProfile = (userId: number, updates: Partial<User>) => {
    // 1. Update the user record
    const updatedUser = db.users.update(userId, updates);
    if (!updatedUser) {
        throw { status: 404, message: "User not found." };
    }

    // 2. If the user is an agent or sub-admin, sync changes to the agent record
    if (updatedUser.role === UserRole.AGENT || updatedUser.role === UserRole.SUB_ADMIN) {
        const agent = db.agents.findById(userId);
        if (agent) {
            db.agents.update(userId, {
                name: updatedUser.name,
                avatar: updatedUser.avatar,
            });
        }
    }
    
    const { password, ...userResponse } = updatedUser;
    return userResponse;
};