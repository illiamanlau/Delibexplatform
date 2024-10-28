// DocumentationTab.tsx
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import 'github-markdown-css/github-markdown.css';

const DocumentationTab: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>('');

  useEffect(() => {
    const fetchMarkdown = async () => {
      try {
        const response = await fetch('/api/readme');
        const text = await response.text();
        setMarkdown(text);
      } catch (error) {
        console.error('Error fetching markdown file:', error);
      }
    };

    fetchMarkdown();
  }, []);

  return (
    <div className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
};

export default DocumentationTab;