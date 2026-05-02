# Demo app, additional fixes and additional features

This file is for adding fixes to the latest version of this app which were introduced in version 2.2 as written in the demo-v2.2.md file

This file is also for instructions related to new features that we want to introduce for the 2.3 version of this demo app.

The goal is to complete all the major features for this app to begin testing them, so that we can begin planning the real production version of this app which would introduce a backend.

### Navigating to the Library, Index, or Subject views from the navigation bar should always display the top of the page

- Currently under some scenarios when navigating to any of these pages using the navigation bar, the previous scrolldown location of the page is preserved from previous interactions with the page.
- However, when navigating to any of these views from the sidebar, we should away see the top of the page.

### Adding a - icon for the Reviews counter

- Currently the Reviews field, which is used for counting the number of reviews each concept has, only has the option of adding using the + icon.
- However, sometimes, the user by mistake can click on the + icon and increase the review count without meaning.
- For this reason, we want to add a - icon as well that decreases the review count by one when the user clicks on it.
- This - icon should be inactive when Reviews count is equal to 0, and only be enabled if Reviews count is greater than 0.
- This icon should be added anywhere on the app where we display the Reviews count field, so in the Concept view, the Library view, the Focus view, the Index view, and the Subject view, if necessary. In case we only use one component to display the review counter in every single view, then ignore this point.
- I feel it is best to align this icon on the left side of the of the number being displayed and to the right side of the Reviews label, so the view should look like - [number] +.. Please try to preserve the same sort of symmetrical design we currently have, it should look natural, and easy to understand.

### Adding focus state for Library, Index, and Subject views, and keyboard navigation.

- We want to introduce the following functionality:
- When the user navigates from the Navigation bar to either the Library, the Index or the Subject view, the first element of the concept list should be in "focused" state.
- For the Library, and the Subject view, this focus state should display using a border color design around the concept element. The design of this focus state should be similar to the general design philosophy for this app: it should look professional, trendy, and sleek, and should match with the general design of the app as it is right now, please use your best judgement to make it look good.
- For the index view, we already have a good looking focus state which is displayed when we click on a concept element on the list on the Index view, are subsequetly redirected to the Concept view page, and when after being redirected we click on the back button of the Concept view page, after we are taken back to the Index view were we were previously and the Concept is highlighted or focused for 1 or 2 seconds. This design looks fairly good, and that is what we want the focus state to look like for the Index view.
- The user should be able to following keyboard shortcuts to navigate between concepts displayed in these views.
  - Down arrow key: This is for navigating to the next concept element, or the element displayed right below the currently focused element. if we reach the end of the list, then this key should not do anything.
  - Up arrow key: This is for navigating to the element right above the current element, if we reach the top of the list, this key should not do anything.
    - The focus state should change to the current element only, if we navigate between list elements, the focus state should only be visible on the current element.
  - Enter key: when a concept element is in focus state, and the user hits the Enter key, then we should navigate to the Concept view of that particular element.
  - Back key: after navigating from any of these views, to the Concept view, when the user hits the Back key, then we should navigate back to the previous view, and the element on the list whose view we were viewing should be in focus state. The focus state should not be removed automatically, as it is happening right now in the index view, but it should remain focus as long as the user does not navigate to another concept element.
  - Space key: this key should work only in the Library, and Subject views, and should not be included in the Index view keyboard functionality.
    - For the Library, and Subject views, the space key should change the state of the selected concept to expanded view if it is collapsed, and to collapsed view if it is currently expanded.

### Updating the Reviews counter using keyboard shortcuts

- The Reviews counter should be able to be updated anywhere they appear (as long as the user is not currently editing markdown) using the + and - keys
- If the concept is in focus state in the Library, or Subject views, or if the user is currently viewing a concept in the Focus view, or the Concept view, then hitting the + key should update the Reviews counter, the same way that clicking on the + icon does currently. If the user hits the - key, then the counter should be updated in the exact way specified for when clicking on the - icon we are introducing.

### Adding Study Session section on the navigation bar

- We are introducing a "Study Session" section on the navigation bar, this section should be labeled in the same style as the "Explore", and the "Subjects" sections we currently have on the navigation bar.
- The Study Session section should be displayed before the Explore section. So from the top we should see first the + New Concept link, then the Search link (the exact way it is right now), and after that, instead of displaying the Explore section, we should see the Study Session section, after the Study Session section then we should see the Explore and then the Subjects sections. So we are basically moving the Explore and Subject down, so that the Study Session section is displayed first.
- The Study Session section is going to be used to add the number of hours the user has studied a particular subject for that particular Study Session.
- The structure of the design of this section is roughly like this:

Study Session [22h15m]
[ +15m ] [ +30m ] [ +1h ] [ +2h ]  
[icon] Subject: [ Mixed ▼ ]  
[ + Add ]

- The design should match the current design of the navigation bar, in particular the Study Session label should look similar to the Explore and Subjects labels.
- The buttons for selecting the time ([ +15m ] [ +30m ] [ +1h ] [ +2h ]) should have a design that matches the general feel of the navigation bar. they should have an active and inactive state. by default all buttons are in inactive state. only one of these button can be active at the same time. clicking on one button makes it active if it was previously inactive. clicking on an active button should make it inactive. if a button is currently active, and the user clicks on another button, then the previous one should become inactive and the newly selected button should become active.
- Please choose a good icon for the Subject label again in a similar style as what we have for the Library, Focus, and Index labels.
- The Subject label should be followed by a select box which defaults to "Mixed". Mixed represents the idea of an uncategorized subject, and is to be selected when the user does not want to break down his study time into Subjects and just wants to log in a session. Otherwise the user should be able to select any Subject.
- The + Add button should be disabled by default and only enabled after the user has selected a time button. Once the Add button is clicked it should be imediately disabled, and the selected time button should become inactive, and the select Subject box should default to Mixed again (if the user had selected a specific Subject before clicking the + Add button).
- For this demo app we should store this in local storage as we have done for all the other functionalities. Saving each session time and subject, and maintain a total time studied. We want to track total time studied by subject, including Mixed, but also total time studied across all subjects. the total time studied acrossed all subjects should be displayed on the Study Session box at the far right in the following format [22h15m], similar to what we have to display the number of concepts per Subject on the Subjects navbar section.

### Change the location of the up and down arrows which are used to move the concept element either up or down when the Sort of option is Custom in the Subject view from the far left to the far right

- Currently this arrow buttons are displayed on the far left of the html element containing the concept element, but this looks feels intrusive, we should move these arrows while maintaining the same functionality
- the new location should be at the far right, they should appear on the right side of the X icon button used for deleting concept elements, maintaining the same sort of spacing and symmetry we have for the pin, expand, and delete icon buttons.

### Focus view, keyboard navigation

- In the Focus view we want to introduce keyboard navigation to move to the next or previous concept element.
- Right arrow key: when clicking on the right arrow key, we should have the exact same functionality as clicking on the Next -> element, when we reach the end of the list the right arrow key should not do anything.
- Left arrow key: when clicking on the left arrow key, we should have the exact same functionality as clicking on the <- Prev element, when reaching the beginning of the list the left arrow key should not do anything.
- The functionality of the left and arrow key should should match the functionality of the prev and next elements.

### Adding image file functionality

- Currently our markdown editors cannot displayed images that are not hosted online.
- We want to add functionality that enables the user to render images on the markdown editors that are not hosted outside the app.
- For example the user may create images using tools like chatgpt that he may want to include in his markdown notes, however if these ai generated images are not hosted online the user cannot render them on the markdown.
- This functionality adds image hosting within our learning application.
- Each concept should have a section for adding images for hosting and referencing. This section should appear right after the References section and before the MVK section.
- This section should be called "Images", and should default have guidance text saying soemthing like "Add images for referencing in the Markdown editors"
- For this demo app these images should be stored locally in the Browser.
- We want support of PNG, JPG, JPEG, and GIF formats.
- If the user is trying to upload a file not in these formats we should not allow it.
- For this demo app we can potentially use IndexedDB rather than just plan localStorage.
- For each uploaded image, we want to create an entry in the Images section of the Concept, with the name of the file, and an adress that can be referenced in the markdown editors so that when it is referenced we are able to display it or render it in the markdown. for example with:
  ![image name](image address).
- This functionality should be as simple and inuitive as possible.
- We should also have a basic optimization functionality to reduce the size of the images where appropriate, ideally we do not want to store large image files. we should have a limit to how big a rendered image looks. the limits should be proportional to the horizontal and veritical size of the image, so that we do not alter the ratio of the image. we should compress large images using standard techniques and standard values and standard image optimization libraries if necessary. i dont have knowledge of how this should be done, but please use standard practices for image file compression, optimization. so when a user uploads a new image we should run the optimization algorithm before persisting, once the algorithm is run successfully then we can persit the image and create the entry on the Images section of the Concept view, the generated address should work right of the box, so that we can reference it on the markdown and be able to render the image. for the production version of this application we will use a real backend or database for this, but for now we can just implement it as a simple demo feature.

### Update /turtleiq page view

- We should remove this url path wherever it is found.
- It should be changed for /app
- The / path will display a landing page for this update.
- The /app path will redirect to the learning application we have right now.

### Updating the logo of the application /app

- We are changing the logo of the webpage and the learning application from 🔍🐢 TurtleIQ to 🔍🐢 TortugaIQ
- The logo of the learning application right now is not vertically aligned, it should be vertically aligned and look like a single logo, 🔍🐢 TortugaIQ
- Clicking on the logo should redirect to the /app path, or the Welcome page we currently have for the learning application.

### Adding Landing page to this web application.

- We currently do not have a landing page, the / path opens in the learning application. However we are adding a landing page.
- So the path / should open the landing page rather than the learning application.
- Only if the user sings in or sings up for the learning application shuold he be redirected to the /app path.
- For the landing page instructions please read the landing-page.md file
- Follow those instructions as best as possible to create this landing page and have it functional for this demo app.

### Adding Authentication workflow

- For this new version we are introducing a basic authentication workflow.
- I have prepared authentication workflow instructions in the authentication.md file
- Please review them and see if they are feasable, otherwise you are free to implement this workflow as best as possible.
- Since this is a demo app it does not have to follow security best practices to the letter, we just want something functional for local testing purposes.
- We also need to add on the learning app, basic signed in user functinoality like, potentially at the bottom of the navigation sidebar. I do not know what is the standard for displaying the signed in user, but we need to follow standard practices, at least in the UI design, maintaining the same similar style we are using currently.
- Likewise, we need to implement standard sign out functionality, potentially using the same section as the one we use for displaying the signed in user, potentially at the bottom of the navigation sidebar.
- I do not know what the standards are for this, please just do something functional that follows UI standards, and looks appealing and goes along with the design of the app.
- When the user signs out they should be redirected to the landing page.
- In general do your best to figure out this "simple" authentication workflows and infer missing details based on best practices, or what is practical for this limited demo app. It should work right out of the box.
