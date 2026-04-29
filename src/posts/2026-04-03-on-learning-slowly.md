---
title: Test 3
date: 2026-04-03
---

# Test

## test

### test

- test
  - test

```
function filterConcepts(concepts, filters) {
  return concepts.filter(c => {
    if (filters.subjects?.length  && !filters.subjects.some(id => (c.subjectIds || []).includes(id)))  return false
    if (filters.topics?.length    && !filters.topics.some(id => (c.topicIds || []).includes(id)))      return false
    if (filters.tags?.length      && !filters.tags.some(id => (c.tagIds || []).includes(id)))          return false
    if (filters.states?.length    && !filters.states.includes(c.state ?? 'NEW'))                       return false
    if (filters.priorities?.length && !filters.priorities.includes(c.priority ?? 'MEDIUM'))            return false
    if (filters.pinned  && !c.pinned) return false
    return true
  })
}
```

### Concept Creation

- Easily create new **concepts** with simple **metadata**

### Concept View

- Manually update concept **status** (state, priority, review count...)
- Add **MVK** for quick reviews and better retention
- Add well thought out notes using **Markdown** [we would include both pictures 2 and 3 under this heading]

### Library View

- Keep concepts **organized** with intuitive search, sorting, and filtering functionality
- Quickly **review** concepts while updating their status in Library mode

### Focus View

- Review concepts **in-depth** in Focus mode

### Index View

- Try **ultra-fast** reviews in Index mode

### Subject View

- Choose which subject you want to review

### Study Sessions

- Keep track of your study time to increase **motivation**

### Overview

- Track your learning overtime

### Create concepts

- Create new **concepts** with simple, flexible **metadata**
- Add **subjects**, **topics**, and **tags** to keep your knowledge organized from the start

### Build each concept

- Update concept details such as **state**, **priority**, **review count**, and **references**
- Add a compact **MVK** for quick reviews and fast recall
- Write structured notes with **Markdown**, a simple, portable, and AI-friendly format

### Organize and review your library

- **Organize** your concepts in a more intuitive way with search, sorting, and filtering, keeping your library maintainable as it grows
- **Review** concepts directly from the **Library** while updating their status

### Review one concept at a time

- Use **Focus** mode for more in-depth review
- Show or hide **MVK**, notes, and references as needed

### Skim concepts at high speed

- Use **Index** mode for ultra-fast review across many concepts
- Move quickly through your knowledge with minimal friction

### Review by subject

- Open a **subject** and review all related concepts in one place
- Create your own concept order for review so concepts build on each other more naturally

### Log study sessions

- Keep track of your **study time** and build consistency
- Log **study sessions** by subject and keep a **history** of your efforts

### Track your progress

- View study activity, concept inventory, and metadata catalogue in one place
- Keep meaningful statistics that support long-term learning

- A clearly defined concept name gives the mind a stable handle.
- A well-thought-out MVK reduces the idea to a highly compressed, usable, and memorable meaning.
- This makes the link between the concept and its representation much easier to form from the start.
- This pairing itself already creates surprisingly strong initial memories
- The concept name can then act as a reliable trigger for recalling and reinforcing the MVK.
- Later review strengthens the link, but the structure already works from the beginning.

a clear concept name gives the mind a stable handle
a clear MVK gives it a minimal but usable meaning
once both are defined well, they become easy to pair
this pairing itself already creates surprisingly strong retention and recall
later review strengthens it, but the structure already works well from the beginning

- A clearly defined concept name gives the mind a stable handle.
- A well-thought-out MVK reduces the idea to a highly compressed, usable, and memorable core.
- This makes the link between the concept and its representation much easier to form from the start.
- That pairing alone can already create surprisingly strong initial memories.
- The concept name can then act as a reliable trigger for recalling and reinforcing the MVK.
- Later review strengthens the link, but the structure already works from the beginning.
