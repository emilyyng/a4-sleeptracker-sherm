--Readme document for Emily Yang & Sherry Tram, emilyy12@uci.edu & smtram@uci.edu, emilyy12 & smtram--

1. How many assignment points do you believe you completed (replace the *'s with your numbers)?

10/10
- 1/1 The ability to log overnight sleep
- 1/1 The ability to log sleepiness during the day
- 1/1 The ability to view these two categories of logged data
- 2/2 Either using a native device resource or backing up logged data
- 2/2 Following good principles of mobile design
- 2/2 Creating a compelling app
- 1/1 A readme and demo video which explains how these features were implemented and their design rationale

2. How long, in hours, did it take you to complete this assignment?

It took us about 15 hours to complete this assignment.

3. What online resources did you consult when completing this assignment? (list specific URLs)

- Ionic Framework documentation (components such as range, modal, alert, item-sliding and datetime): https://ionicframework.com/docs
- Ionic Storage, for backing up logged data: https://github.com/ionic-team/ionic-storage
- Stanford Sleepiness Scale: https://web.stanford.edu/~dement/sss.html
- Apple Human Interface Guidelines, for iOS design conventions: https://developer.apple.com/design/human-interface-guidelines/
- MDN Web Docs, for custom fonts and CSS: https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face

4. What classmates or other individuals did you consult as part of this assignment? What did you discuss?

We (Emily and Sherry) worked together as partners, discussing how to take on each part, dividing the work, 
and reviewing each other's code for bugs. We did not consult others for this assignment.

5. Is there anything special we need to know in order to run your code?

Our app is designed for a phone-sized screen, so we recommend using the browser's device toolbar with an iPhone viewport (such as iPhone 16 Pro) for viewing.
--Aim for no more than two sentences for each of the following questions.--


6. Did you design your app with a particular type of user in mind? If so, whom?

We designed for working adults, who have busy schedules and little time to spare, so logging sleep and daytime sleepiness needs to take only a few taps. 
The Home summary, the bedtime timer and the quick sleepiness slider fit around work and commuting, and the cat illustrations keep the app friendly rather than clinical.

7. Did you design your app specifically for iOS or Android, or both?

We designed specifically for iOS, so we used iOS mode in Ionic and followed Apple's conventions for navigation, modals, alerts and typography.

8. How can a person log overnight sleep in your app? Why did you choose to support logging overnight sleep in this way?

A person can tap the + button (or Record Sleep on Home) to open a sheet with start and end date/time pickers that default to the last 8 hours, 
or press Start Timer at bedtime and Stop when they wake up, which opens the same sheet pre-filled with those times. 
We offered both so people can either log the night the next morning or let a timer track it, and the default times keep logging quick.

9. How can a person log sleepiness during the day in your app? Why did you choose to support logging sleepiness in this way?

A person taps + on the Sleepiness page (or Record Sleepiness on Home) and drags a 1-7 slider that shows a matching cat illustration with the 
Stanford Sleepiness Scale description for that level, and the entry is timestamped when they save. A slider only allows valid values, and the 
cat and description make the scale easy to understand at a glance, so logging is quick enough to do several times a day.

10. How can a person view the data they logged in your app? Why did you choose to support viewing logged data in this way?

Home shows the last 7 days' average time asleep and average sleepiness, and the Overnight and Sleepiness tabs list every log entry, with newest first, 
with swipe actions to edit or delete. Keeping each type of data on its own page keeps the lists easy to scan, while Home gives a useful at-a-glance summary.

11. Which feature choose--using a native device resource, backing up logged data, or both?

We chose to back up logged data (option 2).

12. If you used a native device resource, what feature did you add? How does this feature change the app's experience for a user?

N/A, we did not use a native device resource.

13. If you backed up logged data, where does it back up to?

Logs are saved with Ionic Storage (@ionic/storage-angular), which uses the browser's IndexedDB on the device, 
and they are loaded again when the app starts so they persist across refreshes.

14. How does your app implement or follow principles of good mobile design?

Our app opens to a useful Home screen that summarizes the past seven days and offers one-tap recording, while swipe actions 
and confirmation alerts provide a safety net, and sliders, date pickers and start-before-end validation prevent input errors. 
We followed iOS platform conventions, including a bottom tab bar, sheet modals with grabber handles, native-style alerts, 
chevron list rows and swipe actions, and applied a consistent purple and green palette with custom cat illustrations to give the app a cohesive identity.