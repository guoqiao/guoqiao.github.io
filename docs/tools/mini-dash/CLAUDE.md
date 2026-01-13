# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A simple HTML dashboard designed for an iPad mini 1 (iOS 9.3.5, Chrome 144). The dashboard displays widgets that must work on old browser engines with limited modern JavaScript/CSS support.

## Development Commands

```bash
# Serve locally (access at http://localhost:8000)
make run
```

## Browser Compatibility Requirements

Target device: iPad mini 1, iOS 9.3.5, Safari

When adding or modifying code:
- Use ES5 JavaScript only (no arrow functions, const/let, template literals, Promises, etc.)
- Use `var` instead of `const`/`let`
- Use traditional `function` declarations
- Avoid CSS Grid; use Flexbox with `-webkit-` prefixes where needed
- Avoid modern CSS features (CSS variables, clamp(), etc.)
- All HTML/CSS/JS should be self-contained in single .html files

## Architecture

Single-file HTML widgets. Each widget (like `index.html` clock) contains all HTML, CSS, and JavaScript inline. The webapp is served from an Ubuntu server and accessed remotely by the iPad.
