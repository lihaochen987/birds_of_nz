# Birds Of New Zealand
https://birdsofnz.herokuapp.com/

Please be patient with the website. Entering the site itself and uploading your posts may take a while. This is because the website relies on external APIs. I have not opted for any premium features because I am a poor uni student.

## Acknowledgement
This project is heavily inspired and based on "The Web Developer Bootcamp 2021" by Colt Steele.

## Purpose
The purpose of this project is to serve as an introduction to full-stack programming. Through this project I dip my toes into HTML/CSS/JS, MongoDB, flexbox/grid system, APIs, security and everything that partakes in the process of building a website from scratch.

## Features
Noteable features include

### Nudity / offensive image detector
Done through linking the sightengine API. When a user uploads an image, it is checked whether it has offensive or NSFW content and appropriately accepted or rejected. This detector is applies to the user's profile image and the images they may post onto the website.

### Manual password reset / Forgot password reset
Achieved through nodemailer. There is currently a visual bug in the password reset process.

Namely if the user enters the correct old password and their "new password" and "confirm new password" don't match, the website will display the user successfully changing their password.

DESPITE THIS, THE FEATURE WORKS. IT IS A VISUAL BUG ONLY.

### Infinite scroll / Load animations / Lazyload / Flickity
Multiple features added to help with loading pictures faster and displaying images in a more user appealing way. 

### Characters restrictions on user-submitted description content

### Basic "like" system on user posts and user comments

### User profile pictures with the option to change it

### Drop-down search for user submissions

### User dashboard which shows recent user activities

### Other features I've probably neglected to mention :)

## Improvements
User dashboard activities (recent posts, recent comments) are recorded by shoving everything into a really big list. VERY VERY inefficient, definitely need something better for scaling.

Front-end design and responsiveness is terrible. The website is very ugly and through building this website I've learn't that I don't really have an interest in front-end design. 

The entire debugging method in this website's construction was terrible. Alot of print statements and "brute-force" checks.

The security is very basic. It exists, but it's not very good. 

ALL OF YOUR PASSWORDS AND EMAILS ARE HASHED IN THE DATABASE. EVERYTHING IS SECURE. IF YOU DON'T TRUST THE SECURITY OF THIS WEBSITE PLEASE USE A FAKE EMAIL AND A PASSWORD YOU BARELY USE. A WORKING EMAIL IS ONLY NEEDED FOR THE PASSWORD RESET FEATURE.

## Where next?
I'm possibly looking to mess around with data structures or something. I'm quite busy with university right now so I'll see where I end up :)