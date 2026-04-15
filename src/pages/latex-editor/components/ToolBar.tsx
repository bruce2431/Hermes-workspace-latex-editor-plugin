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
    <div className="h-[38px] border-b border-[#1e293b] flex items-center gap-1 px-2 bg-[#0a0a0f] shrink-0">
      {symbols.map((sym, idx) => {
        if (sym.divider) {
          return <div key={`div-${idx}`} className="w-[1px] h-[16px] bg-[#1e293b] mx-1" />;
        }
        return (
          <button
            key={sym.cmd}
            onClick={() => onInsert(sym.cmd!)}
            className="w-[28px] h-[28px] flex items-center justify-center border border-transparent rounded text-[14px] text-[#94a3b8] hover:border-[#22d3ee] hover:text-[#22d3ee] hover:bg-[#22d3ee]/10 font-mono cursor-pointer transition-colors"
            title={sym.cmd}
          >
            {sym.display}
          </button>
        );
      })}
    </div>
  );
};
