import { useState } from 'react';
import { Auth } from 'firebase/auth';
import { generateMOM } from '../api';

interface MOMGeneratorProps {
  auth: Auth;
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

export function MOMGenerator({ auth }: MOMGeneratorProps) {
  const [rawNotes, setRawNotes] = useState('');
  const [meetingDate, setMeetingDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [attendees, setAttendees] = useState('');
  const [purpose, setPurpose] = useState('');
  const [style, setStyle] = useState<'short' | 'detailed'>('short');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MOMResponse | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'ppt' | 'markdown' | 'plaintext'>('ppt');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawNotes.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await generateMOM(auth, {
        raw_notes: rawNotes,
        meeting_date: meetingDate || undefined,
        attendees: attendees ? attendees.split(',').map(a => a.trim()) : [],
        purpose: purpose || undefined,
        style
      });
      
      setResult(response);
    } catch (error: any) {
      setError(error.message || 'Failed to generate MOM');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* Input Section - Takes up 2 columns */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-brown-200">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-8 h-8 bg-brown-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">✎</span>
              </div>
              <h2 className="text-2xl font-bold text-brown-900">Meeting Details</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="rawNotes" className="block text-sm font-semibold text-brown-700 mb-3">
                  Meeting Notes *
                </label>
                <textarea
                  id="rawNotes"
                  rows={12}
                  className="w-full px-4 py-4 border border-brown-300 rounded-xl shadow-sm focus:ring-2 focus:ring-brown-400 focus:border-transparent transition-colors duration-200 text-brown-900 placeholder-brown-400 resize-none"
                  placeholder="Paste your raw meeting notes here..."
                  value={rawNotes}
                  onChange={(e) => setRawNotes(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="meetingDate" className="block text-sm font-semibold text-brown-700 mb-3">
                    Meeting Date
                  </label>
                  <input
                    type="date"
                    id="meetingDate"
                    className="w-full px-4 py-3 border border-brown-300 rounded-xl shadow-sm focus:ring-2 focus:ring-brown-400 focus:border-transparent transition-colors duration-200 text-brown-900"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="style" className="block text-sm font-semibold text-brown-700 mb-3">
                    Style
                  </label>
                  <select
                    id="style"
                    className="w-full px-4 py-3 border border-brown-300 rounded-xl shadow-sm focus:ring-2 focus:ring-brown-400 focus:border-transparent transition-colors duration-200 text-brown-900"
                    value={style}
                    onChange={(e) => setStyle(e.target.value as 'short' | 'detailed')}
                  >
                    <option value="short">Short & Concise</option>
                    <option value="detailed">Detailed & Comprehensive</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="attendees" className="block text-sm font-semibold text-brown-700 mb-3">
                  Attendees
                </label>
                <input
                  type="text"
                  id="attendees"
                  className="w-full px-4 py-3 border border-brown-300 rounded-xl shadow-sm focus:ring-2 focus:ring-brown-400 focus:border-transparent transition-colors duration-200 text-brown-900 placeholder-brown-400"
                  placeholder="John Doe, Jane Smith, Alex Johnson..."
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="purpose" className="block text-sm font-semibold text-brown-700 mb-3">
                  Meeting Purpose
                </label>
                <input
                  type="text"
                  id="purpose"
                  className="w-full px-4 py-3 border border-brown-300 rounded-xl shadow-sm focus:ring-2 focus:ring-brown-400 focus:border-transparent transition-colors duration-200 text-brown-900 placeholder-brown-400"
                  placeholder="Quarterly planning review, Project kickoff..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !rawNotes.trim()}
                className="w-full flex justify-center py-4 px-6 border border-transparent rounded-xl shadow-sm text-base font-semibold text-white bg-brown-600 hover:bg-brown-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Generating MOM...
                  </div>
                ) : (
                  'Generate MOM'
                )}
              </button>
            </form>

            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="text-red-800 text-sm">{error}</div>
              </div>
            )}
          </div>
        </div>

        {/* Output Section - Takes up 3 columns */}
        <div className="xl:col-span-3 space-y-6">
          {result ? (
            <div className="bg-white rounded-2xl shadow-lg border border-brown-200 overflow-hidden">
              <div className="flex justify-between items-center p-8 border-b border-brown-200 bg-brown-50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-brown-400 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">✓</span>
                  </div>
                  <h2 className="text-2xl font-bold text-brown-900">Generated MOM</h2>
                </div>
                <div className="bg-brown-200 text-brown-700 px-4 py-2 rounded-lg text-sm font-medium">
                  {result.tokens.input + result.tokens.output} tokens
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveTab('ppt')}
                    className={`px-6 py-3 text-sm font-semibold rounded-xl transition-colors duration-200 ${
                      activeTab === 'ppt'
                        ? 'bg-brown-400 text-white shadow-sm'
                        : 'bg-brown-100 text-brown-700 hover:bg-brown-200'
                    }`}
                  >
                    PPT Bullets
                  </button>
                  <button
                    onClick={() => setActiveTab('markdown')}
                    className={`px-6 py-3 text-sm font-semibold rounded-xl transition-colors duration-200 ${
                      activeTab === 'markdown'
                        ? 'bg-brown-400 text-white shadow-sm'
                        : 'bg-brown-100 text-brown-700 hover:bg-brown-200'
                    }`}
                  >
                    Markdown
                  </button>
                  <button
                    onClick={() => setActiveTab('plaintext')}
                    className={`px-6 py-3 text-sm font-semibold rounded-xl transition-colors duration-200 ${
                      activeTab === 'plaintext'
                        ? 'bg-brown-400 text-white shadow-sm'
                        : 'bg-brown-100 text-brown-700 hover:bg-brown-200'
                    }`}
                  >
                    Plain Text
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    rows={20}
                    className="w-full px-4 py-4 border border-brown-300 rounded-xl shadow-sm focus:ring-2 focus:ring-brown-400 focus:border-transparent transition-colors duration-200 font-mono text-sm text-brown-900 resize-none"
                    value={result.copy_blocks[activeTab === 'ppt' ? 'ppt_bullets' : activeTab]}
                    readOnly
                  />
                  <button
                    onClick={() => copyToClipboard(result.copy_blocks[activeTab === 'ppt' ? 'ppt_bullets' : activeTab])}
                    className="absolute top-4 right-4 bg-brown-600 hover:bg-brown-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-brown-200 p-12 text-center">
              <div className="w-16 h-16 bg-brown-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-brown-400 text-2xl">📝</span>
              </div>
              <h3 className="text-xl font-bold text-brown-900 mb-3">Ready to Generate</h3>
              <p className="text-brown-600 mb-6 max-w-md mx-auto">
                Enter your meeting notes on the left and click "Generate MOM" to create structured minutes of meeting.
              </p>
              <div className="bg-brown-50 rounded-xl p-6 max-w-md mx-auto">
                <h4 className="font-semibold text-brown-800 mb-2">What you'll get:</h4>
                <ul className="text-sm text-brown-600 space-y-1 text-left">
                  <li>• Structured discussion points</li>
                  <li>• Clear action items</li>
                  <li>• Multiple export formats</li>
                  <li>• English output regardless of input language</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}