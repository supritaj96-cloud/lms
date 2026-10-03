## Live Demo

🔗 Lms Frontend link : https://lms-frontend-zeta-two.vercel.app

## About

A Learning Management System with two roles:

**Teacher:** uploads courses (video and course details).
**Student:** enrolls in courses and watches them.

**Tech stack:** [React, Node.js, Express, MongoDB, Cloudinary, tailwindcss, uniqid, cors, dotenv, mongoose, multer, nodemon, stripe, svix, vercel]

## Bug I Debugged: Cloudinary Upload API

**Problem:** The upload-course API was failing when the course video was uploaded to Cloudinary using a signed upload.

**What I did:** I traced the failure to the signed upload step. Switching the Cloudinary upload to an unsigned preset made the API succeed, and course upload worked end to end.

**Trade-off:** An unsigned preset removes the server-side signature check, so it is less secure. To limit the risk, I:

- disabled overwriting of assets with the same public ID
- enabled auto-generated, unguessable public IDs
- set an asset folder, `lms-courses`
- restricted uploads to specific formats (mp4, webm, jpg, png) at the preset level

