
BlazeLayout.setRoot('body');

var head = document.getElementsByTagName('head')[0];

//Generate a style tag
var style = document.createElement('link');
style.type = 'text/css';
style.rel = "stylesheet";
style.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.6.3/css/font-awesome.min.css';

head.appendChild(style);


import './routes.js';
import './main.css';
import './layout.html';
import './layout.js';
import './helpers.js';
