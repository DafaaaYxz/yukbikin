const API_KEY = 'AIzaSyB_6PFbktl04BHmkUOCODJxXm4ubKy3fww';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent';

export async function generateAIResponse(prompt: string, persona: string): Promise<string> {
  const fullPrompt = `${persona}\n\nUser: ${prompt}\nAI:`;

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}&alt=sse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    let result = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                result += text;
              }
            } catch (e) {
              // Continue processing other lines
            }
          }
        }
      }
    }

    return result || 'Maaf, saya tidak dapat menghasilkan respons saat ini.';
  } catch (error) {
    console.error('Error generating AI response:', error);
    return 'Maaf, terjadi kesalahan saat menghubungi AI.';
  }
}
