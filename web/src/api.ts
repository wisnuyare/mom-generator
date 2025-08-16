import { Auth } from 'firebase/auth';

interface GenerateRequest {
  raw_notes: string;
  meeting_date?: string;
  attendees?: string[];
  purpose?: string;
  style?: 'short' | 'detailed';
}

interface MOMItem {
  title: string;
  discussion: string;
  action_item: string;
  pic: string;
}

interface MOMResponse {
  mom: {
    date: string;
    attendees: string[];
    purpose: string;
    items: MOMItem[];
  };
  copy_blocks: {
    ppt_bullets: string;
    markdown: string;
    plaintext: string;
  };
  tokens: {
    input: number;
    output: number;
  };
}

export async function generateMOM(auth: Auth, request: GenerateRequest): Promise<MOMResponse> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  const token = await user.getIdToken();
  
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}