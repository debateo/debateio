import "./style.css";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBAZl0_Uo789MgEFNIJdBhW3bn2YRRueiM",
  authDomain: "debateio-7991d.firebaseapp.com",
  projectId: "debateio-7991d",
  storageBucket: "debateio-7991d.appspot.com",
  messagingSenderId: "1077960115094",
  appId: "1:1077960115094:web:0f8fc5a3dc40f4027c93b7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const select = document.getElementById("select");

const topics = [
  "Politics",
  "Sports",
  "Philosophy",
  "Life",
  "Music",
  "Video Games",
  "Abortion",
  "Socialism vs. Capitalism",
  "COVID-19",
  "Liberals vs. Conservatives",
  "Jordan vs. Lebron",
];

function loadTopics(topics) {
  for (let option of topics) {
    let op = document.createElement("option");
    op.value = option;
    op.innerText = option;
    select.appendChild(op);
  }
}

loadTopics(topics);
