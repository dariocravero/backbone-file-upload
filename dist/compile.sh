#!/bin/bash
jsmin < src/jquery.iframe-transport.js > dist/file-upload.min.js
jsmin < src/file-upload.js >> dist/file-upload.min.js 
