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
