// components/DocumentProcessor.js
import React, { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import axios from 'axios';

const CONVERSION_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;

function fireConversionEvent() {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  if (CONVERSION_LABEL) {
    window.gtag('event', 'conversion', { send_to: CONVERSION_LABEL });
  } else {
    window.gtag('event', 'document_processed', {
      event_category: 'engagement',
      event_label: 'document_processing_complete',
    });
  }
}

const DocumentProcessor = () => {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a JPEG, PNG, or PDF file.');
      return;
    }
    
    // Check file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }
    
    setFile(selectedFile);
    setError(null);
    setResult(null);
  };

  const extractTextFromPdf = async (pdfFile) => {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageTexts = [];
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      pageTexts.push(content.items.map((item) => item.str).join(' '));
    }
    return pageTexts.join('\n\n');
  };

  const processDocument = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Step 1: extract raw text from the file client-side
      let text = '';
      if (file.type === 'application/pdf') {
        text = await extractTextFromPdf(file);
      } else {
        const worker = await createWorker('eng');
        const { data } = await worker.recognize(file);
        text = data.text;
        await worker.terminate();
      }

      // Step 2: send extracted text to the server for analysis
      const { data: analysis } = await axios.post('/api/process', { text });

      setResult({
        extractedText: text,
        summary: analysis.summary,
        entities: analysis.entities,
        keywords: analysis.keywords,
        stats: analysis.stats,
      });
      fireConversionEvent();
    } catch (err) {
      setError('Failed to process document. Please try again.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadResults = () => {
    if (!result) return;
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "document_analysis.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-900">Upload Your Document</h3>
        <p className="mt-2 text-gray-600">Supported formats: JPEG, PNG, PDF (max 10MB)</p>
      </div>
      
      {!file && !result && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".jpeg,.jpg,.png,.pdf"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="mt-2 block text-sm font-medium text-gray-900">
              Drag and drop or click to upload a file
            </span>
          </label>
        </div>
      )}
      
      {file && !isProcessing && !result && (
        <div className="mt-4">
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-md">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm text-gray-700">{file.name}</span>
            </div>
            <button 
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-6 flex justify-center">
            <button
              onClick={processDocument}
              disabled={isProcessing}
              className="bg-indigo-600 text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Process Document
            </button>
          </div>
        </div>
      )}
      
      {isProcessing && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center px-4 py-2 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-indigo-600 cursor-not-allowed">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing your document...
          </div>
          <p className="mt-2 text-sm text-gray-600">This may take a few seconds</p>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}
      
      {result && (
        <div className="mt-6">
          <div className="bg-green-50 p-4 rounded-md mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Document processed successfully!</h3>
              </div>
            </div>
          </div>

          {/* Document stats */}
          {result.stats && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
              {[
                { label: 'Words', value: result.stats.wordCount },
                { label: 'Sentences', value: result.stats.sentenceCount },
                { label: 'Paragraphs', value: result.stats.paragraphCount },
                { label: 'Avg words/sentence', value: result.stats.avgWordsPerSentence },
              ].map(({ label, value }) => (
                <div key={label} className="bg-indigo-50 rounded-md p-3 text-center">
                  <p className="text-2xl font-bold text-indigo-700">{value}</p>
                  <p className="text-xs text-indigo-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          {result.summary && (
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-2">Summary</h4>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-700">{result.summary}</p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Extracted Text</h4>
              <div className="bg-gray-50 p-4 rounded-md h-64 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{result.extractedText || 'No text detected'}</pre>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Identified Information</h4>
                <div className="bg-gray-50 p-4 rounded-md h-32 overflow-y-auto">
                  {result.entities && result.entities.length > 0 ? (
                    <ul className="space-y-2">
                      {result.entities.map((entity, index) => (
                        <li key={index} className="flex items-start">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${
                            entity.type === 'DATE' ? 'bg-blue-100 text-blue-800' :
                            entity.type === 'AMOUNT' ? 'bg-green-100 text-green-800' :
                            entity.type === 'EMAIL' ? 'bg-yellow-100 text-yellow-800' :
                            entity.type === 'PHONE' ? 'bg-purple-100 text-purple-800' :
                            'bg-indigo-100 text-indigo-800'
                          }`}>
                            {entity.type}
                          </span>
                          <span className="text-sm text-gray-700 break-words">{entity.value}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No specific information identified</p>
                  )}
                </div>
              </div>

              {result.keywords && result.keywords.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Top Keywords</h4>
                  <div className="bg-gray-50 p-4 rounded-md h-28 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {result.keywords.map(({ word, count }) => (
                        <span key={word} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                          {word}
                          <span className="ml-1 text-gray-500">×{count}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={downloadResults}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              Download Results
            </button>
            <button
              onClick={resetForm}
              className="bg-white text-gray-700 px-4 py-2 rounded-md text-sm font-medium border border-gray-300 hover:bg-gray-50"
            >
              Process Another Document
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentProcessor;
