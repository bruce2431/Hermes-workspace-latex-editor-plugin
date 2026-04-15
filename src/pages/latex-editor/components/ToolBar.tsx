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
    <div className="h-[38px] border-b border-hermes-border flex items-center gap-1 px-2 bg-hermes-bg shrink-0 font-mono">
      {symbols.map((sym, idx) => {
        if (sym.divider) {
          return <div key={`div-${idx}`} className="w-[1px] h-[16px] bg-hermes-border mx-1" />;
        }
        return (
          <button
            key={sym.cmd}
            onClick={() => onInsert(sym.cmd!)}
            className="w-[28px] h-[28px] flex items-center justify-center border border-transparent rounded text-[14px] text-hermes-fg/80 hover:border-hermes-warning hover:text-hermes-warning hover:bg-hermes-warning/10 cursor-pointer transition-colors"
            title={sym.cmd}
          >
            {sym.display}
          </button>
        );
      })}
    </div>
  );
};
