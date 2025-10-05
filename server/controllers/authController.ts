import { db } from '../db';
import * as auth from '../auth';
import { User, UserRole, Agent, AgentStatus } from '../../types';

export const login = ({ email, password }: Record<string, string>) => {
  const user = db.users.findByEmail(email);

  const isMockUserLogin = user && user.password === undefined && password === 'password123';
  const isRegisteredUserLogin = user && user.password !== undefined && user.password === password;
  const isAdminLogin = user && user.email === 'Support@newhollandfinancial.com' && user.password === 'Support@2025';

  if (user && (isMockUserLogin || isRegisteredUserLogin || isAdminLogin)) {
    if (!user.isVerified && user.role !== UserRole.ADMIN) {
        throw { status: 403, message: 'Please verify your email before logging in.', requiresVerification: true, user };
    }
    
    const token = auth.sign({ id: user.id, role: user.role });
    // Omit password from the response
    const { password: _, ...userResponse } = user;
    return { token, user: userResponse };
  }

  throw { status: 401, message: 'Invalid email or password.' };
};

export const register = (userData: Omit<User, 'id' | 'title' | 'avatar'>) => {
    if (db.users.findByEmail(userData.email)) {
        throw { status: 409, message: 'An account with this email already exists.' };
    }

    const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const newUser = db.users.create({
      ...userData,
      title: userData.role === UserRole.AGENT ? 'Agent Applicant' : 'Sub-Admin Applicant',
      avatar: `https://i.pravatar.cc/150?u=${Math.random()}`,
      isVerified: false,
      verificationCode,
    });

    if (newUser) {
        db.agents.create({
            id: newUser!.id,
            name: newUser!.name,
            email: newUser!.email,
            status: AgentStatus.PENDING,
            slug: newUser!.name.toLowerCase().replace(/\s+/g, '-').concat(`-${newUser.id}`),
            leads: 0, clientCount: 0, conversionRate: 0, commissionRate: 0.75,
            location: '', phone: '', languages: [], bio: '', calendarLink: '',
            avatar: newUser!.avatar, joinDate: '', socials: {},
        });
    }
    
    const { password, ...userResponse } = newUser;
    return { user: userResponse };
};

export const verifyEmail = ({ userId, code }: { userId: number, code: string }) => {
    const user = db.users.findById(userId);
    if (user && user.verificationCode === code) {
        db.users.update(userId, { isVerified: true, verificationCode: undefined });
        return { success: true };
    }
    throw { status: 400, message: 'Invalid verification code.' };
};