import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { EditorWorkspace } from './components/EditorWorkspace';
import { ReadabilityBar } from './components/ReadabilityBar';
import { AlgorithmStudio } from './components/AlgorithmStudio';
import { BenchmarkSuite } from './components/BenchmarkSuite';
import { TheoryGuide } from './components/TheoryGuide';
import { analyzeText, buildCorrectedText } from './lib/nlp/nlpEngine';

const PRESETS: Record<string, string> = {
  college: "The scientist study the chemical reaction carefully. She bought a expensive watch and an laptop yesterday. I am definately going to recieve the package tomorow morning. Their going to meet over there because its a beautiful day. We don't need no help with advance planning, but please revert back with the end result.",
  business: "Please revert back as soon as possible with the end result. We dont want to loose our competitive edge. The team have completed the first draft, and each member know their responsibility.",
  academic: "Natural language processing is is an interdisciplinary field combining computational linguistics with statistical models. Deep neural architectures has shown remarkable performance in grammatical error correction.",
  clean: "The quick brown fox jumps over the lazy dog. Clear and precise writing enhances communication across all academic disciplines."
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'editor' | 'visualizer' | 'benchmark' | 'theory'>('editor');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [text, setText] = useState(PRESETS.college!);
  const [dictRevision, setDictRevision] = useState(0);

  // Inspector initial states for matrix tab
  const [matrixSource, setMatrixSource] = useState("recieve");
  const [matrixTarget, setMatrixTarget] = useState("receive");

  // Real-time analysis with memoization
  const analysis = useMemo(() => {
    return analyzeText(text);
  }, [text, dictRevision]);

  // Apply single correction
  const handleApplySingle = (index: number) => {
    const issue = analysis.issues[index];
    if (!issue) return;
    const newText = text.substring(0, issue.start) + issue.suggestion + text.substring(issue.end);
    setText(newText);
  };

  // Apply all corrections
  const handleApplyAll = () => {
    if (!analysis.correctedText) return;
    setText(analysis.correctedText);
  };

  // Ignore an issue
  const handleIgnore = (index: number) => {
    // Replaces issue by temporarily bypassing it in text or slicing
    const issue = analysis.issues[index];
    if (!issue) return;
    // We can simply filter it out or trigger custom ignore
    analysis.issues.splice(index, 1);
    // Force re-render
    setDictRevision(prev => prev + 1);
  };

  // Jump from card to DP matrix tab
  const handleInspectMatrix = (src: string, tgt: string) => {
    setMatrixSource(src);
    setMatrixTarget(tgt);
    setActiveTab('visualizer');
  };

  const handleLoadPreset = (key: string) => {
    if (PRESETS[key]) {
      setText(PRESETS[key]!);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab: string) => setActiveTab(tab as any)}
        theme={theme}
        setTheme={(th: string) => setTheme(th as any)}
      />

      <main className="flex-1 max-w-[1540px] w-full mx-auto px-6 py-6">
        {activeTab === 'editor' && (
          <div>
            <EditorWorkspace
              text={text}
              setText={setText}
              issues={analysis.issues}
              metrics={analysis.metrics}
              correctedText={analysis.correctedText}
              onApplySingle={handleApplySingle}
              onApplyAll={handleApplyAll}
              onIgnore={handleIgnore}
              onInspectMatrix={handleInspectMatrix}
              onDictionaryAdded={() => setDictRevision(prev => prev + 1)}
              onLoadPreset={handleLoadPreset}
            />
            <ReadabilityBar metrics={analysis.metrics} />
          </div>
        )}

        {activeTab === 'visualizer' && (
          <AlgorithmStudio
            key={`${matrixSource}-${matrixTarget}`}
            initialSource={matrixSource}
            initialTarget={matrixTarget}
          />
        )}

        {activeTab === 'benchmark' && (
          <BenchmarkSuite />
        )}

        {activeTab === 'theory' && (
          <TheoryGuide />
        )}
      </main>
    </div>
  );
};

export default App;
