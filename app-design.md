This file contains experimental design for a learning application.

Use this file to get instructions about how to create this app from scratch.

### General instructions

- We want to call this application TurtleIQ for this experimental phase.
- This is a frontend only app for experimental purposes.
- Create app using node.js with React. Can be a vite project
- Since we do not have a backend or database, use React state, potentially Context API, or the most trending Redux tool, or the most trending state handling tool, as needed, to handle all the data related updates.
- The style of the UI should be similar to trending apps such as chatgpt, notion, or similar apps that focus on content management.
- The core of this app can be thought of as something similar to flashcard apps, but it will have several differences.
- Instead of thinking of "flashcards", we can think of "cards", these cards are more for long term storage and review, than for short term practice/memorization.
- There are several objects by which we will design the application

### Main Objects

- Subject. This is the highest level object of the app. However, the user cannot directly add or remove Subjects. This depends on the Concepts.
- Concept. Concepts belong to Subjects. When a user creates a new Concept the user must specified the following info
  - Concept name - mandatory
  - Subject - mandatory
  - Topic - optional
  - Subtopic - optional
  - Tag(s) - optional
- Notice that the name should just be variable within the Concept Object.
- But Subject, Topic, Subtopic, and Tag should be their own separate Objects.
- For each of these objects there should be an option to select existing objects, for example Subject, Topic, Subtopic, Tag, or else the user should be able to type a new object for creation
- When a Concept is created these related objects must be created as well (if they do not exist)
- when creating a new Concept the user can potentially add multiple Subjects, Topics, Subtopics, Tags
- Each concept should have a Reference field, but this should only appear once the Concept has been created. Here the user can save for example urls, or book name, page number, etc
- Each Concept should be thought as a card. On the Concept view, we want the user to be able to add markdown notes (only after the concept has been created). So each concept should have a default markdown editor to add notes, this editor should be super simple, it should simply take in the markdown code, and have a code view and a preview view. When the user first opens up a Concept we should only see the rendered Markdown rather than the editor, however the user should have the option to click on an "Edit" button to enter the editor mode, this editor should also have a "Save" and "Cancel" buttons, if the user clicks on Save the markdown should be saved and the user should no longer see the editor and only see the rendered Markdown notes, if the user clicks "Save" then the latest unsaved markdown changes should be discarded and the user should no longer see the editor mode and only see the rendered Markdown code.
- This app should have a Subject view where the user can see all the Concepts that are related to that particular Subject and be able to navigate to the Concepts.
- The user should be able to delete Concepts from the Subject view.
- There should also be a Search view where the user should be able to locate saved concepts by either name, or by Subject, Topic, Subtopic, Tag.
- Concepts should be ordered in alphabetical order in every view where they are listed (search, subject)
