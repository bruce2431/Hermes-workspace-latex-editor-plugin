import { SymbolCategory } from '@/types/latex';

export const LATEX_SYMBOLS: SymbolCategory[] = [
  {
    name: 'Greek Letters',
    symbols: [
      { command: '\\alpha', display: 'α', description: 'Alpha' },
      { command: '\\beta', display: 'β', description: 'Beta' },
      { command: '\\gamma', display: 'γ', description: 'Gamma' },
      { command: '\\delta', display: 'δ', description: 'Delta' },
      { command: '\\epsilon', display: 'ε', description: 'Epsilon' },
      { command: '\\zeta', display: 'ζ', description: 'Zeta' },
      { command: '\\eta', display: 'η', description: 'Eta' },
      { command: '\\theta', display: 'θ', description: 'Theta' },
      { command: '\\lambda', display: 'λ', description: 'Lambda' },
      { command: '\\mu', display: 'μ', description: 'Mu' },
      { command: '\\pi', display: 'π', description: 'Pi' },
      { command: '\\sigma', display: 'σ', description: 'Sigma' },
      { command: '\\phi', display: 'φ', description: 'Phi' },
      { command: '\\omega', display: 'ω', description: 'Omega' },
    ]
  },
  {
    name: 'Operators',
    symbols: [
      { command: '\\sum_{i=1}^{n}', display: '∑', description: 'Sum' },
      { command: '\\int_{a}^{b}', display: '∫', description: 'Integral' },
      { command: '\\partial', display: '∂', description: 'Partial derivative' },
      { command: '\\nabla', display: '∇', description: 'Nabla / Gradient' },
      { command: '\\infty', display: '∞', description: 'Infinity' },
      { command: '\\leq', display: '≤', description: 'Less than or equal' },
      { command: '\\geq', display: '≥', description: 'Greater than or equal' },
      { command: '\\neq', display: '≠', description: 'Not equal' },
      { command: '\\approx', display: '≈', description: 'Approximately' },
      { command: '\\times', display: '×', description: 'Cross product' },
    ]
  },
  {
    name: 'Structures',
    symbols: [
      { command: '\\frac{numerator}{denominator}', display: 'a/b', description: 'Fraction' },
      { command: '\\sqrt{x}', display: '√', description: 'Square root' },
      { command: '^{2}', display: 'x²', description: 'Superscript' },
      { command: '_{2}', display: 'x₂', description: 'Subscript' },
      { command: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', display: '[ ]', description: 'Matrix' },
      { command: '\\begin{cases} x & \\text{if } y \\\\ z & \\text{otherwise} \\end{cases}', display: '{', description: 'Cases' },
    ]
  }
];
