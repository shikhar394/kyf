'use client'
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import useWebSocket, { ReadyState } from 'react-use-websocket';




export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  /*
  const { sendMessage, lastMessage, readyState } = useWebSocket('ws://localhost:8000/ws', {
    onOpen: () => console.log('Connected to WebSocket'),
    onError: (error) => console.error('WebSocket error:', error),
    onClose: () => console.log('WebSocket connection closed'),
    shouldReconnect: (closeEvent) => true, // Will attempt to reconnect on all close events
  });

  // Update messages when we receive a new message
  useEffect(() => {
    if (lastMessage !== null) {
      setMessages(prev => [...prev, lastMessage.data]);
    }
  }, [lastMessage]);
  */

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      console.error("No file selected");
      return;
    }

    setUploadError(null); // Clear any previous errors
    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("Attempting to upload to:", "http://localhost:5172/upload");
      
      const response = await fetch("http://localhost:5172/upload", {
        method: "POST",
        body: formData,
        mode: 'cors',

      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${response.statusText}\n${errorText}`);
      }

      const data = await response.json();
      console.log("Upload successful:", data);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to connect to server. Please ensure the server is running.';
      
      setUploadError(errorMessage);
      console.error("Upload error details:", {
        message: errorMessage,
        error: error
      });
      // Don't throw here - handle the error gracefully
      // Consider showing an error message to the user instead
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
                   
        {/* File upload section */}
        <div className="w-full max-w-md p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
          <label htmlFor="pdf-upload" className="block mb-2 text-sm font-medium">
            Upload PDF
          </label>
          <input
            type="file"
            id="pdf-upload"
            accept=".pdf"
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-foreground file:text-background
              hover:file:bg-[#383838]"
            onChange={handleFileChange}
          />
        </div>
        {uploadError && (
          <div className="text-red-500 text-sm mt-2">
            {uploadError}
          </div>
        )}
        {file && (
          <Button onClick={handleSubmit} disabled={!file}>Submit</Button>
        )}
      </main>
    </div>
  );
}
