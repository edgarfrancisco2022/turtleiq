# Fixes related to the demo-v2.md update

After the latest updates to this app, which were based on the demo-v2.md file, now we use this demo-v2.2.md file to make some fixes for some things which are not working as expected.
We will also add a few changes based on the testing I have done.

### Concept view State and Priority option selection dropdowns.

- These dropdowns have a background color for each option with a styling with round corners. However the vertical height of each of these options seems to be overlapping with each other. We should fix this and have the vertical height of each option to not overlap with the options below or above it. If anything it would be preferable to have a sort of margin in between. The focus state of each option should display the border without part of it being hidden by the overlap of the options around it. Also the design of these options looks a bit clunky, the design should look a bit more sleek. Perhaps making the vertical height for each option slightly smaller and/or the text size slightly smaller could help making it look less clunky.
- When one of these 2 dropdowns is open, when we click on the other drop down it also opens but the first dropdown we had opened remains open, only one dropdown should be open at a time, if we click on the other then the current should be closed in the same way as clicking outside of it.
- these changes should be applied anywhere these dropdowns are displayed
- In the list view, and in the subject view, these dropdowns are not being displayed as expected when we click on them when the concept elements are in not expanded state. only a small fraction of the dropdown is visible, the rest is hidden because it reaches the end of the html box of the concept list element. we need to make these dropdown be visible even if they go below the space within they live, even if they have to overlap and hide part of the concept elements below.

### Change the name of the List link on the side bar to Library

- since we are using the name Library in the actual page that is displayed when clicking on List on the sidebar, it is better that we should name it Library instead of List.
- I feel Library sounds more appealing, and increases sense of ownership.
- If there as better icon in the same style as the ones that we are currently using for List, Focus, and Index, that can be applied to the new label (Library) then we could try changing it, as the one right now looks more like List than Library, otherwise if there is not a better option we should just leave it as it is.

### Potential change of icon in the Search link on the sidebar

- The search link on the side bar currently displays this icon 🔍. it looks good. But the icons that we use for List, Focus, and Index look much more professional and appealing, if we can use an icon in a similar style and proportions that represents search that would be great. Otherwise, if there is not such an icon, we can just leave it as it is for now.
- If there is such an icon, we ccould also use it in the search bar of the search functionality instead of the existing one, otherwise if there is no such an icon we can just leave it as it is.

### Display empty MVK rather than the editor in the List (Libary) view when MVK is empty

- Currently in the List (Library) view, when we expand a particular concept element which has an empty MVK (the user has not added anything to the MVK), the editor is displayed.
- However we want to display the empty MVK instead and the option to click on Edit MVK.
- this change should be easy, just display the empty MVK the same way that happens right now when we click "cancel" on the open editor that is displayed when a concept element with an empty MVK is exampended.

### Make the pin and the + icons of the concepts slightly bigger everywhere

- These icons are currently kind of too small. They should not look big, the design should remain sleek, but right now they are too small.
- Try to keep similar proportions for example with the edit icon in the Concept view
- In the list or library view and the subject view all the icons of each elements should have similar proportions.
- As mentioned the change doesnt have to be drastic, just enough to make them more important looking.
- This change should be everywhere these icons appear, maintaining good proportions.

### Focus view, Show MVK and Show Notes button should only allow one to be displayed at a time.

- Currently both Show MVK and Show Notes buttons can be in active state at the same time.
- However we want that only one should be able to be active at a time.
- If one is active, then when clicking on the other, the first one should go back to inactive state.

### Focus view, Show MVK and Show Notes active state should allow the user to edit notes

- Currently the user cannot enter editor mode.
- User should be able to enter editor mode in the same way as in the Concept view.
- The focus view is meant for the user to be able to spent more time on each concept, so user should be able o edit and update notes.

### Scrolldown location save is not working as expected.

- When we click on a concept on the List, Index, or Subject view, some times the Concept view is displayed but as if it had already been scrolled down.
- We should always see the top of the page when navigating from a concept from any location of the page.
- The scrolldown location that we should save is the one on the List, Index, and Subject view when we click on a particular concept, if we navigate back to the List, Index or Subject views from a Concept view, we should see these pages in the location where we were before navigating to the concept.
- If we navigate to List, Index, or Subject views by other means than clicking back on the Concept view, then we should always see the top of the page.

### Remove High Priority and Pinned first from sorting functionality anywhere they appear on the app.

- After testing I feel these sorting options make the app clunky, we already have the Priorities and the Pinned filters, so we should remove these sorting options anywhere they appear on the app.

### Add A Show References button in Focus mode

- Currently in focus mode we can only see the Show MVK and Show Notes for each concept.
- But we are currently not displaying a Show References button
- We should add a Show References button similar to the two existing ones and in the exact same style, with the exact same functionality.
- So the user should be able to enter edit mode and update markdown notes when the button is in active state.
- Remember only one of these three buttons should be able to be active at a time.

### Update app icon at the top of the Navigation bar

- instead of having 🐢, we should have 🔍🐢

### Update guidance text for empty MVK section

- Currently we have this guidance text: "Write the smallest useful representation in your own words. Keep it concise: a tiny example, key words, a short synthesis, or a mini diagram."
- We should update this text to the following:
  "Write the smallest useful representation of this concept in your own words. Keep it concise, intuitive and easy to remember: a simple example, a few keywords, a short synthesis, a picture, or a mini diagram."
