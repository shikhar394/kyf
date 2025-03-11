'use client'
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from 'react-markdown';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"



const steps = [
  "Uploading file...",
  "Processing file...",
  "Analyzing file...",
  "Generating analysis...",
  "Emailing reports to partners",
  "✅ Done!"
]

// Get the txt files in public folder.
const files = [
  {name: "Background check" ,file:"founder_background_check.txt"},
  {name: "Founder Evaluation", file: "founder_evaluation_rubric.txt"},
  {name: "Suggested follow up questions", file: "follow_up_questions.txt"},

]


export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [sent, setSent] = useState<boolean>(false);
  const [step, setStep] = useState<number>(0);
  const [txtFiles, setTxtFiles] = useState<Array<{ name: string; file: string; content: string }>>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  const submitToGetLogs = async () => {
    setSent(true);

    // Await for 2 seconds to render step array
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStep(i);
    }

    // Load the files from the public folder.
    const txtFiles = await Promise.all(files.map(async (fileObj) => {
      const response = await fetch(`/${fileObj.file}`);

      if (!response.ok) {
        throw new Error(`Failed to load file: ${fileObj.file}`);
      }

      return { content: await response.text(), ...fileObj };
    }));
    setTxtFiles(txtFiles)
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center w-full max-w-3xl">
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
          <Button onClick={submitToGetLogs} disabled={!file}>Submit</Button>
        )}

        {/* Steps list and File contents stacked vertically */}
        <div className="w-full flex flex-col gap-8">
          {/* Steps section */}
          {sent && (
            <div className="w-full">
              <div className="space-y-4">
                {steps.slice(0, step + 1).map((stepText, index) => (
                  <div
                    key={index}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-300 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="p-4 flex items-center gap-4">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {stepText}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File contents section */}
          {txtFiles.length > 0 && (
            <div className="w-full space-y-6">
              {txtFiles.map((fileObj, index) => (
                <Collapsible
                  key={index}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-300 shadow-lg rounded-2xl overflow-hidden"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <CollapsibleTrigger className="flex items-center w-full text-left bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 px-8 py-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                        <ChevronDown className="h-5 w-5 text-primary transition-transform duration-200 group-ui-open:rotate-180" />
                      </div>
                      <h3 className="text-xl font-semibold tracking-tight">{fileObj?.name}</h3>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="bg-white dark:bg-gray-900 px-8 py-6 border-t border-gray-100 dark:border-gray-800">
                      <div className="prose dark:prose-invert max-w-none prose-headings:font-semibold prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-a:text-primary">
                        <ReactMarkdown>{fileObj.content}</ReactMarkdown>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
