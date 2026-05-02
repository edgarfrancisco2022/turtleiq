# demo learning app v2

In this file we add more updates for this application.
Consider this as instructions to update this learning application.
We are trying to have it ready to be deployed and tested using GitHub pages.
We want a "cheap" solution for now such as GitHub pages, just to test what it would feel like in an "online" scenario, rather than just local testing.

The app is currently working fine as it is right now, the basic idea of the app has facilitated learning during testing, now we want to add the remaining core functinality and start testing, but still as just a quick demo production.

We are not thinking about architecture, or having a backend or database layers for now, we are not thinking about complex state management for example with React Query, all we want is to see the main functionality work in a demo scenario, to test if the learning strategies we are trying to implement work as expected.

Please continue building from what we have now, as that is working fine.

Here are a few points that you should consider for this update

## General points related to what we already have

### Concept Update option

- The add concept workflow is working fine.
- The delete concept workflow is working fine.
- Now we need to add an update concept workflow.
  - We should work with what we already have.
  - The update workflow should lead to the same modal as the add concept workflow.
  - In the update workflow the fields of the modal should be pre-populated with whatever info the concept already has.
  - The Save button that we see in add workflow should be changed to an Update button in the update workflow.
  - We should be able to see an update button add the concept level
  - Please select the most professionally looking, and intutive place for the user for this update button at the level of the concept page.

### Subject listing page location and state keeping

- Currently if we scroll down the list of Concepts in the Subject view, and if we then click on a concept and are redirected to the concept view, when we click on the <- Back option in the concept view, it takes us back to the Subject view but to the beginning of the list.
- We want that when we hit back on the <- Back option in the page view that we are taken back to the Subject view but to the exact same location where we were when we clicked on the particular concept. Ideally when hitting back the concept we were just viewing on the subject list should be focused.

### Removing Subtopics

- Right now each concept can have Subjects, Topics, Subtopics, and Tags
- However during testing we noticed that Subtopics are sort of redundant. In practice we only need Topics. If a user needs to add Subtopics they can just add them as Topics.
- So we are removing the Subtopics metadata elements. Please remove Subtopics anywhere they appear on the app.

### the Concept References section should use markdown notes instead of the current approach

- Currently we can add references through an add button.
- However, we want this to be more simple. The References section should work in the exact same way as the Notes section.
- We want the user to be able to add markdown notes in this section as he needs. We do not want multiple Reference entries.

### Concept should have a MVK section

- Currently we have two main sections for adding notes at the Concept level, the References section, and the Notes section
- Now we want to add a third section called MVK, which stands for Minimum Viable Knowledge
- This section should be located between the References section and the Notes section.
- It should work in a similar way as the Notes section, where the user can add markdown notes, the functionality should be the exact same.
- As guidance text for when this markdown section is empty, the user should see something like: "Minimum Viable Knowledge: add a simple and intuitive representation of this concept. It could be a simple example, a few key words, a super short explanation in your own words, a picture, a mini diagram, etc.
- This guidance text is probably not the best solution, but it should suffice for now.. later we can think of a sort of template with better instructions. The point is that we should teach the user what a good MVK looks like, since this is one of the most important elements of the learning system.

### Adding Concept State functionality at the Concept level

- We are now introducing a Concept state functionality
- The best place to add this functionality is probably in the Metadata section where the Subjects, Topics, and Tags live, please find the best design for organizing this Metadata section.
- The user should be able to select any of these possible states:
  - NEW
  - LEARNING
  - REVIEWING
  - MEMORIZING
  - STORED
- This state should also be saved in local storage and persist across browser sections for this demo app

### Adding Concept Priority at the Concept Level

- Similarly, we are introducing a Concept Priority functionality.
- This should also live in the Metadata section, please find the best possible design to have Subjects, Topics, Tags, State, and Priority not look cluttered. It should look well organized, appealing and intuitive.
- The user should be abel to select any of these possible states:
  - LOW
  - MEDIUM
  - HIGH

### Adding expanded view of the Subject list view elements

- Each element in the Subject list view should be expandable by clicking on an expand button.
- when the user clicks on the expand button, the user should be able to see the MVK section of the concept for quick review.
- If the MVK section is empty, the user should be able to update this section without having to click on the Concept. The user should be able to update the MVK section without having to be on the Concept page.

### Removing Tags and Topics from the Subject list view

- Please remove the Tags and Topics from conconept elements from the Subject list view.
- We do not need to see these, as the view is for quick review.

### Adding Concept State and Concept Priority in the Subject list view

- Instead we should be able to see and should be able to update the Concept state and the Concept priority for each element in the Subject list view.
- Please use a nice modern professionally looking design for this (do not just have like a box with options to select)

### Adding Review count functionality to the Concept object

- Each concept should have a Review count field defaulting to 0 for a new Concept, and having a + icon/button.
- When the user clicks the + icon the review count should go up by one.
- This Review count field and icon should also be visible at the Subject level list view.
- Please figure out best design for this, it should look modern, sleek and inuitive.

### Adding Date added field to Concept object

- I am not sure if we currently have this field.
- In case we do not have it please add it. It should not be visible for now. but will needed for sorting.

### Sorting of concepts in the Subject view

- currently we do not have sorting capabilities at the Subject level view.
- We should have a sorting functionality, living at the top of this list. The concepts should be able to be ordered in three different ways
  - Alphabetical
  - By date added
  - Custom
    - For custom ordering the user should be able to change the order of concepts by a move up or move down functionality
    - We should have icons for moving up or down, simple arrows would suffice.
    - We need to redesign the delete functionality and combine it with this new functionality, so that all 3 things share the same design space, looking modern, sleek and professional.
    - If the user clicks on the move up icon it should switch locations with the element above it.
    - Similarly when the user clicks on the move down icon, it should switch locations with the element below it.
    - The custom ordering defaults to the date added ordering, however, if the user chooses to update it, the new state should be persisted and stored across browser sessions.
    - The move up and move down functionality and the icons should not exist in the other two ordering modes (Alphabetical, Date added).

## Further changes

The previously mentioned changes are the main changes we need for v2 of this demo app, however, I have been talking to chatgpt about design ideas, and we have come up with a general set of instructions.

these instructions may overlap with what we already have and with the instructions above. In some cases they might add new things. In some cases however you might find contradictions with respect to what we have and the instructions above. Please understand that we are just vibe coding, and working on a simple demo app, please try to infer the best possible meaning in case of contradiction. Where there is no contradiction and it refers to further enhancements, please note that the instructions might not be super thorough, try to infer the details and do your best to produce working functionality based on the limited instructions. In cases where there are overlaps (with potential differences) with what we already have and the instructions above, do your best to determine best course of action, choosing always whatever feels best based on the design philosphy outlined in the following instructions.

Also notice that chatGPT instructions assume that we have not a working first version, and in many cases it seems like we are starting from scratch.. Please just try your best to combine chatGPTs instructions to what we already have. We should not re-implement everything if it doesnt make sense. However if you feel improvements can be made based on the chatgpt instructions we can totally reimplement anything. Especially I want the design of the app to continue improving, becoming more intuitive, easy to use, modern looking, sleek, and professional.

Notice that the instructions provide very clear philosophy about the app. Feel free to reimplement anything to make this philosophy a reality as much as possible.

## ChatGPT instructions for further changes (notice that the markdown structure starts at the # level, this is because this was copied from ChatGPT)

You are helping me design and implement a learning app. I want you to understand not just the features, but the philosophy behind the product, because the philosophy is the main thing. This app should remain extremely simple, highly intentional, and focused only on high-leverage features. It should not evolve into a bloated “monster app” with dozens of edge-case features.

# Core Idea

This is a learning app built around **Concepts** as the main unit.

A concept is a named mental object. The app is based on the idea that long-term learning is not mainly about short-term memorization, but about building, maintaining, and revisiting a large personal library of mental objects over time.

The app should help users maintain **hundreds or thousands of concepts** as easily as possible.

This app is **not** trying to compete by being flashier than Obsidian, RemNote, or Anki. In fact, it may look almost “too simple,” and that is part of the philosophy. The goal is not to impress users with complexity. The goal is to build a system that actually works for long-term retention and ownership of knowledge.

# Learning Philosophy

The app is based on these principles:

## 1. Long-term learning over short-term memorization

The focus is on long-term retention, familiarity, and maintenance of knowledge over time, not on intense short-term memorization or test-style recall.

## 2. Knowledge as named mental objects

Each concept has a concise identity: the **concept name**.
This name acts like an index key.
The concept also has a **Minimum Viable Knowledge (MVK)** representation, which is the smallest useful mental representation of the concept.

The core mapping is:

- **Concept Name** = key / index
- **MVK** = minimal internal representation

This is inspired partly by how a child learns language:

- first a word/object is recognized
- then a vague but meaningful representation develops
- then repeated exposure strengthens it

## 3. Indexing rather than exhaustive memorization

The system should help users recognize and recover concepts without forcing them to memorize everything explicitly.
The app should support a light but durable kind of retention.

## 4. Simplicity as leverage

Simplicity is not just aesthetic.
Every extra field, feature, or structure adds maintenance cost.
Only features that clearly strengthen the core learning loop should exist.

No:

- complex graph views
- heavy nested structures
- complicated linkage systems
- feature sprawl
- algorithmic cleverness for its own sake

## 5. Easy maintenance at scale

A major purpose of the app is making it easy to maintain a large knowledge library over years.
This means:

- low friction concept creation
- intuitive organization
- fast review
- strong filtering/sorting
- lightweight interfaces

## 6. Lightweight review, not oppressive review

The review experience should feel light, intuitive, and scalable.
It should allow users to quickly revisit lots of information without feeling overwhelmed.
The user should be able to review a lot of information almost without effort.

## 7. User control over opaque automation

The app should not rely on complicated hidden review algorithms.
The user should have visible and direct control through simple tools like:

- state
- priority
- review count
- pinning

## 8. Ownership and motivation

A key part of the app is helping the user feel:

- this is my knowledge
- this is my domain
- this is my growing expertise
- this is my collection / library / set of conceptual objects

The app should motivate the user through:

- growth of concept counts
- clear concept identities
- subject/topic collections
- visible accumulation

Not through:

- streaks
- badges
- shallow gamification
- manipulative engagement tricks

## 9. Accumulation over perfectionism

The system should encourage:

- capture now
- refine later

The user should not feel they must fully understand or fully polish a concept before adding it.

## 10. Evolve only through high-leverage points

If the app evolves, it should evolve only around features that clearly strengthen the core system without weakening simplicity.

# What a Concept Is

A Concept is the central entity in the system.

Each concept should have:

- **Name**
- **Subjects**
- **Topics**
- **Tags**
- **State**
- **Priority**
- **Review Count**
- **Pinned status**
- **References**
- **MVK**
- **Notes**

## Important note about sections

We deliberately decided to keep the core content sections very simple.

The main content sections on the Concept page should be:

- **References**
- **MVK**
- **Notes**

We discussed ideas like Keywords and Trigger fields, but decided they likely add unnecessary overlap, confusion, and maintenance cost.

### Why not Keywords / Trigger as separate fields?

Because:

- they overlap too much with MVK
- they create extra cognitive overhead
- they slow concept creation
- they may make the app look richer without actually increasing leverage

Instead, the MVK can naturally include:

- cue words
- tiny examples
- compact intuitive phrasing
- distinguishing phrases

So MVK should remain the central compact representation field.

# MVK Definition

MVK = **Minimum Viable Knowledge**

This is one of the central ideas of the app.

The MVK should be:

- concise
- intuitive
- written in the user’s own words
- the smallest useful representation of the concept
- enough to help reconstruct the concept later

The MVK can include:

- a tiny example
- cue words
- a concise intuitive synthesis

But it should remain compact.

## MVK helper philosophy

Instead of creating more fields, the app should help users write better MVKs.

Possible helper text for the MVK field:

> Write the smallest useful representation of the concept in your own words. Keep it concise and intuitive. A tiny example, cue words, or a short synthesis, diagram or picture.

# Main Functionalities

## 1. Add Concept flow

This is a very high-leverage part of the system.
Concept creation must be **extremely fast and low friction**.

The user clicks something like “Add Concept”.
A modal appears.

The modal should ask only for the minimum needed metadata:

- Concept Name
- Subject(s)
- Topic(s)
- Tag(s) (if kept; should remain lightweight)

The main goal is:

- capture fast
- refine later

Accepting the modal should navigate directly to the Concept page.

## 2. Concept page

The Concept page should show:

### Top metadata section

- Name
- Subject(s)
- Topic(s)
- Tag(s)
- State
- Priority
- Review Count
- Pinned status

### Main content sections

- References
- MVK
- Notes

These should be editable as markdown notes.

### Review controls

The user should be able to:

- increment review count easily
- update state
- update priority
- pin/unpin the concept

## 3. Sidebar-based navigation

The sidebar should list subjects.
Clicking a subject takes the user to a list view of concepts related to that subject.

This is enough for v1; a full dashboard can wait.

## 4. Search

There should be a basic but strong search function.
The user should be able to find concepts quickly.

Search should likely work by:

- concept name
- subject
- topic
- tag

Retrieval must feel fast and easy, because this strengthens ownership.

# Main Modes / Views

We discussed three main modes, each with a distinct cognitive purpose.

## 1. List Mode

This is the main workbench / management view.

Purpose:

- browse concepts
- manage concepts
- filter and sort
- expand MVK
- update state / priority / review count / pin

### In List Mode, concepts should display compactly, showing:

- concept name
- state
- priority
- review count
- pinned status
- optional expandable MVK

### List Mode should support strong filtering and sorting.

Useful filters:

- by subject
- by topic
- by tag
- by state
- by priority
- pinned only

Useful sorts:

- alphabetical
- most reviewed
- least reviewed
- newest (by date added)
- oldest (by date added)
- pinned first
- high priority first

This mode should feel like the practical operating surface of the app.

## 2. Focus Mode

This is a single-concept review mode.

Purpose:

- deliberate review
- one concept at a time
- minimal visual noise
- easy concept-by-concept revisiting

Possible behavior:

- show concept name first
- show metadata
- optionally reveal MVK
- optionally reveal notes
- navigation functionality at the top of this view
  - next icon
  - previous icon
  - Selection of concepts to review by using the same types of filters and sorting capabilities mentioned above mentioned above (Subject, Topics, Tags, State, Priority, Pinned, etc for filtering. alphabetical, most reviewed, least reviewed, newest (by date added), oldest (by date added), pinned first, high priority first for sorting). These filters default to all concepts. Sorting should be defaulted to alphabetical.
- allow quick update of review count / state / priority / pin

This should be simple and calm, not flashy.

## 3. Index Mode

This is inspired by the index of a textbook.

Purpose:

- very fast skimming
- rapid recognition
- quick re-exposure to many concepts
- lightweight reinforcement of familiarity

This mode should let the user lightning-fast skim through large numbers of concepts.

It should feel like:

- compact
- object-centered
- recognition-based
- low-friction
- exposure-oriented

It should not just be List Mode with different styling. It should feel distinct and optimized for rapid scanning.

For example in this view we should only see the Name of the concepts and the Review count field with the + icon to quickly update the review count.

the user should still be able to click on the concept and naviage to the concept page.

if the user naviagates to the concept page and then clicks on the <- Back button the should return to the same location of the page where they were before clicking on the concept, ideally the concept name shoudld be in focused state.

Please design this Index mode to look more like a textbook index rather than using boxes for each concepts. However, do make it look modern, sleek, and professional.

In the long term this section is for the user to be able to review hundreds of concepts in a matter of minutes.

At the top of the page we should have similar filtering and sorting functionality as in List Mode

# Core Metadata Fields

Each concept should include:

- **State**  
  Possible values:
  - New
  - Learning
  - Reviewing
  - Memorizing
  - Stored

  These labels may be refined later, but the general idea is to let the user categorize where the concept is in their learning process.

- **Priority**  
  Possible values:
  - Low
  - Medium
  - High

  Priority gives the user direct control over what deserves more attention.

- **Review Count**  
  Starts at 0.  
  The user can manually increment it with a + button or similar simple control.

- **Pinned**  
  Allows the user to flag concepts for any personal reason, for example:
  - come back later
  - currently important
  - not sticking
  - deserves more attention

# Ownership and Motivation

This is central to the app.

The user should feel:

- this is my conceptual library
- these are my concepts
- I am building my expertise
- I want to come back because the collection is growing and becoming richer

## Ways the app should support ownership

- strong concept names
- visible counts
- concept totals
- subject totals
- topic totals
- pinned concepts
- clear subject collections

## Counts are important

Counters should appear in meaningful places, for example:

- total global concept count
- subject-level concept count
- topic-level concept count
- maybe pinned concept count

These are motivational because they make the library feel real and growing.

# Product Principles

## The app should feel almost stupidly simple

Navigation and interaction should be extremely intuitive.
A user should not need to “learn the app”.

## The app should not become a monster app

Avoid:

- feature sprawl
- too many fields
- too many modes
- complex graph functionality
- edge-case-driven design

## Every feature must pass the leverage test

Ask:

> Does this strengthen the core loop of capturing, revisiting, maintaining, and owning concepts?

If not, it probably should not exist.

# Features we intentionally do NOT want in v1

Do not build these into v1 unless there is a very strong reason:

- knowledge graphs
- backlinks as a core paradigm
- nested note trees
- keyword entities
- separate Trigger field
- AI features
- complex spaced repetition algorithms
- advanced statistics
- activity history
- neglected concepts mode driven by analytics
- full dashboard
- gamification features
- social features
- edge-case bloat

Some of these may appear in future versions, but not in v1.

# High-Leverage V1 Ideas We DO Want

These are the strongest current ideas:

- ultra-fast concept creation
- concept page with References / MVK / Notes
- simple metadata
- sidebar subject navigation
- strong search
- Subject view
- List Mode
- Focus Mode
- Index Mode
- pinning
- filtering/sorting
- visible counts
- compact/simple UI
- inline quick updates where possible
- remembering view state if simple enough
- low-friction experience everywhere

# Product Summary

This app is a **learning app for long-term conceptual retention**.

It is built around:

- named concepts
- minimal internal representations (MVK)
- simple organization
- fast maintenance of large knowledge libraries
- lightweight review
- personal ownership of knowledge

It is not trying to maximize flashiness, complexity, or feature count.
It is trying to make long-term learning feel:

- simple
- intuitive
- scalable
- motivating
- personally owned

The app should feel like a quiet but powerful personal conceptual library.

# What I want from you

Help me design and build this app in a way that stays faithful to this philosophy.

When suggesting features, architecture, UI, or data models:

- prioritize simplicity
- prioritize high-leverage points
- avoid unnecessary complexity
- avoid feature bloat
- protect the core concept model
- protect the speed of concept creation
- protect the lightweight nature of review
- protect the feeling of ownership

Always ask:

> Does this make the system stronger without making it heavier?

# End of ChatGPt instructions

### filtering and sorting capabilities notes

- Rereading this file I noticed that we have sorting and filtering capabilities in the search section, subject view, list mode, focus mode, and index mode. However the details for each type of view are not always the same. Please try to consolidate the simplest and most effective way to implement these filtering and sorting features in a way that works the exact same way in all views whenever possible (for example i know that the Subject view cannot display elements from other subjects, so it cannot be the exact same, also we do not want custom sorting for List Mode, Focus Mode, and Index Mode as these depend on what the user needs to review at any given moment), but in general as much as possible try to keep the sorting and filtering similar or as close to the same as possible in all different views, ideally we should use the same code for every view when possible.

### inferring details

- Also I understand that these instructions are not perfectly logical or complete, please as much as you can try to infer details adding missing things if needed, use your intelligence to make this app as good as possible, closing all loops would be ideal, we do not want half finished functionality, everything needs to be solid from the get go to start testing.

### Adding tab space in markdown notes

- Currently when pressing tab on the markdown notes editors, the focus moves to outside the markdown editor and we are not able to continue typing
- Please fix this problem. We should be able to press tab and add the tab or indent space as on a regular editor.

### Design feedback

- The current design of the app as it is is not bad.
- However in some places it looks a bit too HTML for lack of a better word, if you can make it look more professional, trendy, modern, or sleek looking please try your best, in later versions of the app i might provide screenshots, for now id like to see how much you can improve without specific feedback.
