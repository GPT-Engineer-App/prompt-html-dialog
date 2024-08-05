import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, MessageSquare } from "lucide-react"

const Index = () => {
  const [apiKey, setApiKey] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [iframeContent, setIframeContent] = useState('');
  const [activeMode, setActiveMode] = useState('chat');
  const [selectedAPI, setSelectedAPI] = useState('default');

  useEffect(() => {
    const storedApiKey = localStorage.getItem('openai_api_key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setSelectedAPI('openai');
    }
  }, []);

  const handleApiKeyChange = (e) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    if (newApiKey) {
      localStorage.setItem('openai_api_key', newApiKey);
      setSelectedAPI('openai');
    } else {
      localStorage.removeItem('openai_api_key');
      setSelectedAPI('default');
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;

    const newMessage = { role: 'user', content: chatInput };
    const updatedHistory = [...chatHistory, newMessage];
    setChatHistory(updatedHistory);
    setChatInput('');

    try {
      let response;
      if (apiKey && selectedAPI === 'openai') {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are a helpful assistant that generates HTML content. Please respond with valid HTML wrapped in <html> tags.'
              },
              ...updatedHistory
            ]
          })
        });
        const data = await response.json();
        const assistantReply = data.choices[0].message.content;
        setChatHistory([...updatedHistory, { role: 'assistant', content: assistantReply }]);
        const htmlContent = assistantReply.match(/<html>([\s\S]*)<\/html>/i)?.[1] || '';
        setIframeContent(htmlContent);
      } else {
        response = await fetch('https://jyltskwmiwqthebrpzxt.supabase.co/functions/v1/llm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5bHRza3dtaXdxdGhlYnJwenh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjIxNTA2NjIsImV4cCI6MjAzNzcyNjY2Mn0.a1y6NavG5JxoGJCNrAckAKMvUDaXAmd2Ny0vMvz-7Ng'
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: 'You are a helpful assistant that generates HTML content. Please respond with valid HTML wrapped in <html> tags.'
              },
              ...updatedHistory
            ]
          })
        });
        const data = await response.json();
        const assistantReply = data.choices[0].message.content;
        setChatHistory([...updatedHistory, { role: 'assistant', content: assistantReply }]);
        const htmlContent = assistantReply.match(/<html>([\s\S]*)<\/html>/i)?.[1] || '';
        setIframeContent(htmlContent);
      }
    } catch (error) {
      console.error(`Error calling API:`, error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/3 p-4 bg-white shadow-md">
        <div className="mb-4">
          <Input
            type="password"
            placeholder="Enter OpenAI API Key (optional)"
            value={apiKey}
            onChange={handleApiKeyChange}
            className="mb-2"
          />
          <p className="text-sm text-gray-500">
            {selectedAPI === 'openai' ? 'Using OpenAI API' : 'Using default API'}
          </p>
        </div>
        <div className="flex mb-4">
          <Button
            variant={activeMode === 'chat' ? 'default' : 'outline'}
            className="mr-2 flex-grow"
            onClick={() => setActiveMode('chat')}
          >
            <MessageSquare className="mr-2 h-4 w-4" /> Chat
          </Button>
          <Button
            variant={activeMode === 'edit' ? 'default' : 'outline'}
            className="flex-grow"
            onClick={() => setActiveMode('edit')}
          >
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Button>
        </div>
        {activeMode === 'chat' && (
          <div className="h-[calc(100vh-240px)] overflow-y-auto mb-4 bg-gray-50 p-2 rounded">
          {chatHistory.map((msg, index) => (
            <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block p-2 rounded ${msg.role === 'user' ? 'bg-blue-100' : 'bg-green-100'}`}>
                {msg.content}
              </span>
            </div>
          ))}
          </div>
        )}
        {activeMode === 'chat' && (
          <div className="flex">
            <Textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type your message here..."
              className="flex-grow mr-2"
            />
            <Button onClick={handleChatSubmit}>Send</Button>
          </div>
        )}
        {activeMode === 'edit' && (
          <div className="h-[calc(100vh-240px)] overflow-y-auto mb-4 bg-gray-50 p-2 rounded">
            <Textarea
              value={iframeContent}
              onChange={(e) => setIframeContent(e.target.value)}
              placeholder="Edit HTML content here..."
              className="w-full h-full"
            />
          </div>
        )}
      </div>
      <div className="w-2/3 p-4">
        <div className="flex justify-between mb-4">
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="home">Home</SelectItem>
              <SelectItem value="about">About</SelectItem>
              <SelectItem value="contact">Contact</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Pencil className="mr-2 h-4 w-4" /> Visual Edit
          </Button>
        </div>
        <iframe
          srcDoc={iframeContent}
          title="App Preview"
          className="w-full h-[calc(100vh-100px)] border-2 border-gray-300 rounded"
        />
      </div>
    </div>
  );
};

export default Index;
