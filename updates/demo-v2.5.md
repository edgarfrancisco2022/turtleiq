### Updating the Index view

Currently the Index view does not seem to warrant its existence, as it is like a less functional Library view. The idea of an index view is that you can review concept elements much faster.

In order to achieve this, the index view should be able to display each concept element in such a way that they are closer together.

For example we should remove the alphabetic grouping divider lines their labels (A, B, C, etc), this seems to unecessarily be taking screen space.

Second we need a design that does more than list the elements one after the other (each on a new line).

My idea is to have a kind of grid design, where you would read from left to right and from top to bottom.

I do not know how to accomplish this in an effective way, please analyse feasability of this plan, and what cool design idea we could use

### MVK display solution for Index view

Loved the redesign of the Index view using pills instead of the previous one column solution. Now we need a solution to have the option to display the MVK for each concept pill. In testing I found that not having the option to see the MVK would force the user to navigate to each particular concept if he needs to refresh his memory, this would take time and break the desired quick study flow.

I do not know how to solve this problem, these are my current thoughts, either each pill would have an MVK label where the user could click, and we would display the MVK as a sort of pop up element (maybe not really a modal, but a sort of guidance type of element, i dont know what these are called).

Another idea is not displaying an MVK label and instruct the user to use the space key to see the MVK.

Please think of potentially better ideas that make for great simple intutive user experience.

Using a modal to display the MVK is still not out of the question, but it seems it might potentially break the intended super quick review flow we are aiming for.

Please provide a plan with best options for a solution to this problem.

### The previous solution to display in MVK in Index view needs rethinking

The previous solution did not seem to be ideal in testing. The MVK panel is by default at the bottom of the index list, so if the user has hundreds or thousands or concepts the panel would be out of view. At this point I cannot think of any other potential solution other than just having a modal displaying the entire concept view, a sort of shortcut way to navigate between the Index view and the Concept view in a relatively faster way without breaking the review flow as much, please provide thoughts on this and a new plan to implement a solution regarding what we have been talking about. do you think the modal idea is the only viable solution?

### MVK solution in Index view needs redesign

- The latest solution for the MVK in the Index view is much more convincing, thanks. We just need to update the design to improve the user experience.
- We need a way to select whether the MVK panel is visible or not. By default the MVK panel should be not visible.
- I am thinking of two potential ways to implement this.
  1. The MVK panel itself could always remain visible at the bottom of the page, but it would have an option to reveal the MVK itself or to hide it, my inutition tells me this might be the more intuitive user experience, but I am not a UI/UX desig exxpert.
  2. The other idea I have is to have the panel hidden by default and have an option to display the panel somewhere at the top of the page, maybe next or after the filtering controls.
- The MVK panel it self should be redesign to look more professinal, trendy, and sleek, as that is the design philosophy of this app, in particular, the design should match better the design of the app in general, we need to try to make it more appealing, as the index view right now still feels kind of unconvincing since it feels like a less functional library view.
- I feel the x icon to close the MVK panel might not be necessary, depending on how we decide to implement this.
- The MVK panel should not display the name of the concept, this seems repetitive as the pill with the concept name is already selected, instead it should just display "MVK"
- Please free to come up with better ideas to work on this problem.

### Index view updates

- Currently the user can navigate between concept elements of the Index view using the up or down arrow keys of the keyboard. We need to update this functionality so that the user may navigate using the left and right keybaord arrwo keys.
- the left and right arrow keys would now be used for horizontal navigation, but also for previous line and next line navigation.
- the up and down arrow key should navigate the user to the element just below it, if there are severl conconcepts on the horizontal space below it, the user should be navigated to the first element from left to right. in other words, if there is an element that takes even the smallest bit of horizontal space that matches with the horizontal space of the original element, then it should be considered as candidate to navigate to when clicking the down arrow, but only the left most element should be the final target.
- the same should happen when using the up arrow key but in the opposite direction.
- please feel free to improve on this keyboard navigation idea, im just sort of improvising the behavior, but please feel free to improve it. for example im not currently considering potential edge cases or problems with this idea.
- if the user clicks on a particular concept element of the concept list in the Index view, then they are taken to the concept view, but when clicking on the back button of the concept view, they are taken back to the index view, but to the top of the page, and the first element of the list is in focus state. we need the same type of funcitonality as in the other views (Library, Subject, etc) where the original concept element that was clicked remains focus when the user clicks the back button of the concept view, and also we need to save the scroll position the user was on before clicking on the concept element, so that he is redirected to the exact same location he was when he first clicked on the element. if the user navigates to the index view from the side navigation bar then we do not need to preserve any of these things and should be reset to defaults where we see the top of the page and the first concept element in focus view.
- When the user hits the space keyboard key on a concept element on the Index view, the MVK panel should be expanded for that particular concept (if the MVK panel was not expaneded), if the user hits the space key when the MVk panel is expaned it should then change to collapsed state.
- The user should be able to select a pill element with the mouse click, so if a concept element is currently not in focus state, it should not be linkable, clicking on it should change its state to focus state, the other element that was in focus state before clicking on the new element should be changed to not focus state, once a pill element is in focus state like this, then it becomes linkable, clicking on it again should take the user to the concept view of that particular element.

### Update sidebar to be collapsible

- Currently our navigation sidebar is not collapsible
- We want a collapsible navigation sidebar, but currently I do not know what a good design for this would be.
- I am not a hundred percent sure about the design for this.
- My first thought is to implement something similar to what YouTube has, please see attached images, which uses a hamburger icon, with the collapsed state displaying icons for some of the pages but not all. If we went with this approach, in this app we could probablly display icons for the new concept workflow, the search, the library, focus, and index views, and potentially the sign out. the study session functionality right now would be difficult to condense into a single icon, and the same is true of the subject view.
- however i feel i do not have enough expertise, so please take the role of a UI/UX expert and propose a good solution for this, we want something that would potentially work for mobile as well, it should be simple, inuitive, professional, trendy and sleek.

### Updating the MVK preview in Library and Subject views

- After testing the MVK panel we added in the index view, I feel this design is better than what we have in the Library and Subject views currently.
- Please update the Library and Subject views to work in the same manner.
- With this update we should remove the existing MVK preview functionality in the Library and Subject views, so that we only maintain the MVK panel implementation.
- In addition we should add an edit button similar to what we have in the Concept view to the MVK panel in all three views, so that the user has ability to edit the MVK.

### Redesign of Study Session section discussion

- Currently the Study Session section is working as expected. But I am thinking it takes a large portion of the sidebar navigation panel.
- My idea is that this is a sort of widget of this learning application, and I feel its purpose is fundamental to motivate the user to continue studying.
- This means, that this widget should existing in a place where it is visible at all times, the user should be able to add sessions in a way that feels almost automatic.
- My current idea for this redesign is to move this section into a bar at the top of the pages, similar to how we have an MVK panel at the bottom of the Library, Index, and Subject views, my idea was to have a Study Session panel at the top of all the views.
- However this approach means that we would have less screen space for the actual views, and part of me feels that it might be unconventional.
- I do not know anything about UI/UX design, please assume the role of a UI/UX design expert and provide feedback on the feasability of this idea, and what other potentially better options there could be.
