# LaTeX Editor Agent Instructions

When generating or modifying LaTeX documents in this project, you can specify the compiler engine by adding a magic comment at the very top of the main `.tex` file.

Supported compilers: `pdflatex`, `xelatex`, `lualatex`.

Format:
```latex
% !TEX program = lualatex
```

If no magic comment is provided, the system will default to `pdflatex`.
Always consider the user's requirements (e.g., specific fonts, Unicode support) when deciding whether to use `xelatex` or `lualatex` and add the magic comment accordingly.
