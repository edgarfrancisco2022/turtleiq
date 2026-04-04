# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TurtleIQ** — a frontend-only learning/knowledge management app built with React + Vite. No backend or database; all data lives in client-side state. UI style targets content-focused apps like Notion/ChatGPT.

## Setup & Commands

This project is initialized from scratch. Once created, standard Vite+React commands apply:

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Lint (if eslint configured)
```

## Data Model

All objects are managed in client-side state (React Context, Zustand, or similar trending state tool — prefer what's most current):

- **Subject** — top-level grouping; not created directly, derived from Concepts
- **Concept** — core entity (card); belongs to one or more Subjects
  - Required: `name`, `subject`
  - Optional: `topic`, `subtopic`, `tag(s)`, `references`, `markdownNotes`
- **Topic**, **Subtopic**, **Tag** — standalone objects; selectable from existing or creatable inline when adding a Concept

When a Concept is created, any referenced Subject/Topic/Subtopic/Tag objects are auto-created if they don't already exist.

## Architecture & Views

- **Subject view** — lists all Concepts under a Subject; supports delete; alphabetical order
- **Concept view (card)** — shows rendered Markdown by default; "Edit" button opens a simple markdown editor with Code/Preview toggle, Save/Cancel actions; References section only visible after Concept exists
- **Search view** — filter Concepts by name, Subject, Topic, Subtopic, or Tag; results in alphabetical order
- **Concept creation form** — multi-select or inline-create for Subject, Topic, Subtopic, Tag fields
