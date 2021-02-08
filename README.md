# Birds Of New Zealand

## Acknowledgement
This project is heavily inspired and based on "The Web Developer Bootcamp 2021" by Colt Steele.

## Purpose
The purpose of this project is to serve as an introduction to full-stack programming. Through this project I tip my toes into HTML/CSS/JS, MongoDB, flexbox/grid system, APIs, security and everything which allows a website to be functional.

## Features
Deviations from the base project include:

### Nudity / offensive image detector
Done through linking the sightengine API. When a user uploads an image, it is checked whether it has offensive or NSFW content and appropriately accepted or rejected.

### Manual password reset / Forgot password reset

### Infinite scroll / Load animations / Lazyload / Flickity
Multiple features added to help with loading pictures faster and displaying images in a more user appealing way. 

### Characters restrictions on user-submitted description content

### Basic "like" system on user posts and user comments

### User profile pictures with the option to change it

### Drop-down search for user submissions

### User dashboard which shows recent user activities

## Improvements
There is a bug with the forgot password reset. The feature works as intended. However, when the user enters the wrong old password and the same new and confirm password, the user is redirected the the /birds page with a success message. 

User dashboard activities (recent posts, recent comments) are recorded by shoving everything into a really big list. VERY VERY inefficient, something better is needed for website scaling.

Front-end design and responsiveness is terrible. This is due to a lack of experience by me.

## Where next?
Currently interested in focusing more on the front-end design of websites. This includes delving deeper into layouts like grid / flexbox. I have learnt alot from this project, but it has reached a point where it's much more fruitful to start a new project than go back and tweak everything in this one. 