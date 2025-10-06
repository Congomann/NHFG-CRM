import { GoogleGenAI, Type } from "@google/genai";
import { User, Client, Task, Agent, Policy, UserRole, AISuggestion, EmailDraft, Interaction } from '../types';

// FIX: Per @google/genai guidelines, the API key must be obtained directly from the environment variable.
// Fallbacks and warnings are removed as the key is assumed to be configured.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const summarizeNotes = async (notes: string): Promise<string> => {
  // FIX: Per @google/genai guidelines, the API_KEY availability check is removed.
  // The application assumes the key is valid and present.
  try {
    const prompt = `Summarize the following client notes for a busy insurance agent. Extract key points, action items, and any client concerns. Format the output clearly with headings. Notes:\n\n${notes}`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error summarizing notes:", error);
    return "Error: Could not summarize notes.";
  }
};

const suggestionSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        action: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['CREATE_TASK', 'DRAFT_EMAIL', 'ASSIGN_LEAD', 'INFO_ONLY'] },
            clientId: { type: Type.INTEGER },
            prompt: { type: Type.STRING },
            assignToAgentId: { type: Type.INTEGER },
            assignToAgentName: { type: Type.STRING },
          },
          required: ["type"],
        },
      },
      required: ["priority", "title", "description", "action"],
    },
};

const getRoleSpecificPrompt = (currentUser: User, allData: { clients: Client[], tasks: Task[], agents: Agent[], policies: Policy[], interactions: Interaction[] }): string => {
    const today = new Date().toISOString().split('T')[0];
    let roleInstructions = '';
    let dataPayload = {};

    switch(currentUser.role) {
        case UserRole.AGENT:
            const agentClients = allData.clients.filter(c => c.agentId === currentUser.id).map(c => {
                 const lastInteraction = allData.interactions.filter(i => i.clientId === c.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                 const clientPolicies = allData.policies.filter(p => p.clientId === c.id).map(p => p.type);
                 return { id: c.id, name: `${c.firstName} ${c.lastName}`, status: c.status, joinDate: c.joinDate, lastContact: lastInteraction?.date, policies: clientPolicies };
            });
            roleInstructions = `
                You are an AI assistant for an insurance agent named ${currentUser.name}.
                1.  Identify active clients who have not been contacted in over 30 days. Suggest a "CREATE_TASK" to follow up.
                2.  Identify active clients with only one policy type. Suggest "DRAFT_EMAIL" to explore cross-selling another relevant policy.
                3.  Identify leads that have not been contacted in over 7 days. Suggest a "CREATE_TASK".
            `;
            dataPayload = { clients: agentClients };
            break;
        case UserRole.SUB_ADMIN:
            const unassignedLeads = allData.clients.filter(c => c.status === 'Lead' && !c.agentId).map(c => ({ id: c.id, name: `${c.firstName} ${c.lastName}`, joinDate: c.joinDate }));
            const agentWorkloads = allData.agents.filter(a => a.status === 'Active').map(a => ({ id: a.id, name: a.name, clientCount: a.clientCount, leadCount: a.leads }));
            roleInstructions = `
                You are an AI assistant for a Sub-Admin responsible for lead distribution.
                1.  Review the unassigned leads.
                2.  Analyze the agent workloads (client and lead counts).
                3.  For each unassigned lead, suggest the best agent to assign them to using the "ASSIGN_LEAD" action. Prioritize agents with lower workloads.
            `;
            dataPayload = { unassignedLeads, agentWorkloads };
            break;
        case UserRole.ADMIN:
            const agentPerformance = allData.agents.filter(a => a.status === 'Active').map(a => ({ name: a.name, clientCount: a.clientCount, conversionRate: a.conversionRate }));
            const policyDistribution = allData.policies.reduce((acc, p) => {
                acc[p.type] = (acc[p.type] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
             roleInstructions = `
                You are an AI assistant for the Admin of the insurance agency.
                1.  Provide high-level strategic insights using the "INFO_ONLY" action.
                2.  Analyze agent performance and identify the top-performing agent based on client count and conversion rate.
                3.  Analyze the policy distribution and identify the most and least popular policy types.
            `;
            dataPayload = { agentPerformance, policyDistribution };
            break;
    }

    return `
        SYSTEM: You are a helpful AI assistant for an insurance CRM. Your goal is to provide actionable suggestions to help users be more productive. Analyze the provided JSON data and generate a list of suggestions in the specified JSON format. Today's date is ${today}.
        
        USER_ROLE_INSTRUCTIONS:
        ${roleInstructions}

        DATA:
        ${JSON.stringify(dataPayload)}
    `;
}

export const getAIAssistantSuggestions = async (
  currentUser: User,
  allData: { clients: Client[], tasks: Task[], agents: Agent[], policies: Policy[], interactions: Interaction[] }
): Promise<AISuggestion[]> => {
  try {
    const prompt = getRoleSpecificPrompt(currentUser, allData);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: suggestionSchema,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) return [];
    
    return JSON.parse(jsonText);

  } catch (error) {
    console.error("Error getting AI assistant suggestions:", error);
    // Return a user-friendly error suggestion instead of crashing
    return [{
        priority: 'High',
        title: 'AI Assistant Error',
        description: `Could not generate suggestions. The AI model may be temporarily unavailable. Please try again later. Error: ${error instanceof Error ? error.message : String(error)}`,
        action: { type: 'INFO_ONLY' }
    }];
  }
};

export const draftEmail = async (prompt: string, clientName: string): Promise<Omit<EmailDraft, 'to' | 'clientName'>> => {
    try {
        const fullPrompt = `As an insurance agent, draft a professional and friendly email to a client named ${clientName}.
        
        The email should be based on this objective: "${prompt}".
        
        Return a JSON object with two keys: "subject" and "body". The body should use paragraphs for readability.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        subject: { type: Type.STRING },
                        body: { type: Type.STRING }
                    },
                    required: ["subject", "body"]
                }
            }
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error drafting email:", error);
        return {
            subject: "Follow-up",
            body: "Could not generate email draft. Please write your message manually."
        }
    }
};
