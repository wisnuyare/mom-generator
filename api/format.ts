interface MOMItem {
  title: string;
  discussion: string;
  action_item: string;
  pic: string;
}

interface MOMResponse {
  items: MOMItem[];
}

interface GenerateRequest {
  raw_notes: string;
  meeting_date?: string;
  attendees?: string[];
  purpose?: string;
  style: 'short' | 'detailed';
}

interface LLMResult {
  mom: MOMResponse;
  tokens: {
    input: number;
    output: number;
  };
}

export function formatResponse(llmResult: LLMResult, request: GenerateRequest) {
  const currentDate = new Date().toISOString().split('T')[0];
  
  const formattedMOM = {
    date: request.meeting_date || currentDate,
    attendees: request.attendees || [],
    purpose: request.purpose || '',
    items: llmResult.mom.items
  };

  const copyBlocks = {
    ppt_bullets: generatePPTBullets(llmResult.mom.items),
    markdown: generateMarkdown(formattedMOM),
    plaintext: generatePlaintext(formattedMOM)
  };

  return {
    mom: formattedMOM,
    copy_blocks: copyBlocks,
    tokens: llmResult.tokens
  };
}

function generatePPTBullets(items: MOMItem[]): string {
  return items.map(item => 
    `• ${item.title}\n  - Discussion: ${item.discussion}\n  - Action: ${item.action_item}\n  - PIC: [To be assigned]`
  ).join('\n\n');
}

function generateMarkdown(mom: any): string {
  const { date, attendees, purpose, items } = mom;
  
  let markdown = `# Meeting Minutes\n\n`;
  markdown += `**Date:** ${date}\n`;
  if (attendees.length > 0) {
    markdown += `**Attendees:** ${attendees.join(', ')}\n`;
  }
  if (purpose) {
    markdown += `**Purpose:** ${purpose}\n`;
  }
  markdown += `\n## Discussion Items\n\n`;
  
  items.forEach((item: MOMItem, index: number) => {
    markdown += `### ${index + 1}. ${item.title}\n\n`;
    markdown += `**Discussion:** ${item.discussion}\n\n`;
    markdown += `**Action Item:** ${item.action_item}\n\n`;
    markdown += `**PIC:** _[To be assigned]_\n\n`;
  });
  
  return markdown;
}

function generatePlaintext(mom: any): string {
  const { date, attendees, purpose, items } = mom;
  
  let text = `MEETING MINUTES\n\n`;
  text += `Date: ${date}\n`;
  if (attendees.length > 0) {
    text += `Attendees: ${attendees.join(', ')}\n`;
  }
  if (purpose) {
    text += `Purpose: ${purpose}\n`;
  }
  text += `\n=== DISCUSSION ITEMS ===\n\n`;
  
  items.forEach((item: MOMItem, index: number) => {
    text += `${index + 1}. ${item.title}\n`;
    text += `   Discussion: ${item.discussion}\n`;
    text += `   Action Item: ${item.action_item}\n`;
    text += `   PIC: [To be assigned]\n\n`;
  });
  
  return text;
}