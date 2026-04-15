import React from 'react';

interface ToolBarProps {
  onInsert: (command: string) => void;
}

export const ToolBar: React.FC<ToolBarProps> = ({ onInsert }) => {
  const symbols = [
    { cmd: '\\alpha', display: 'α' },
    { cmd: '\\beta', display: 'β' },
    { cmd: '\\gamma', display: 'γ' },
    { cmd: '\\delta', display: 'δ' },
    { cmd: '\\theta', display: 'θ' },
    { divider: true },
    { cmd: '\\sum_{i=1}^{n}', display: '∑' },
    { cmd: '\\int_{a}^{b}', display: '∫' },
    { cmd: '\\nabla', display: '∇' },
    { cmd: '\\infty', display: '∞' },
    { divider: true },
    { cmd: '\\frac{1}{2}', display: '½' },
    { cmd: '\\begin{pmatrix} \\end{pmatrix}', display: '[]' },
    { cmd: '\\begin{cases} \\end{cases}', display: '{}' },
  ];

  return (
    <div className="h-[44px] border-b border-ide-border flex items-center gap-1.5 px-3 bg-ide-panel shrink-0 font-mono overflow-x-auto">
      {symbols.map((sym, idx) => {
        if (sym.divider) {
          return <div key={`div-${idx}`} className="w-[1px] h-[20px] bg-ide-border mx-1" />;
        }
        return (
          <button
            key={sym.cmd}
            onClick={() => onInsert(sym.cmd!)}
            className="min-w-[32px] h-[32px] px-1 flex items-center justify-center rounded-md text-[14px] text-ide-muted hover:bg-ide-surface hover:text-ide-text border border-transparent hover:border-ide-border cursor-pointer transition-all shadow-sm"
            title={sym.cmd}
          >
            {sym.display}
          </button>
        );
      })}
    </div>
  );
};
