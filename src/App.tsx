import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Loader2, Sparkles } from 'lucide-react';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setImage(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }],
        },
      });

      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setImage(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
          foundImage = true;
          break;
        }
      }

      if (!foundImage) {
        setError('No image was generated. Please try a different prompt.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to generate image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">AI Image Generator</h1>
          <p className="text-zinc-600">Enter a prompt to generate an image using Gemini.</p>
        </header>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic city with flying cars..."
              className="flex-1 px-4 py-2 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none"
            />
            <button
              onClick={generateImage}
              disabled={loading || !prompt.trim()}
              className="px-6 py-2 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 disabled:bg-zinc-400 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate
            </button>
          </div>
          {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
        </div>

        {image && (
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200">
            <img
              src={image}
              alt="Generated"
              className="w-full h-auto rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
      </div>
    </div>
  );
}
