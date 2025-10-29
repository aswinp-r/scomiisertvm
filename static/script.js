// ====== Import Firebase SDKs ======
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";

// ====== Firebase Configuration ======
const firebaseConfig = {
  apiKey: "AIzaSyDMeX3-iFLWVy17IzqUijXwAFFroO1LjvM",
  authDomain: "scom-1e5e6.firebaseapp.com",
  projectId: "scom-1e5e6",
  storageBucket: "scom-1e5e6.firebasestorage.app",
  messagingSenderId: "670586958567",
  appId: "1:670586958567:web:6b264ba16f44137ebda842",
  measurementId: "G-BVZPMP1G8B"
};

// ====== Initialize Firebase ======
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
getAnalytics(app);

// ====== Local Variables ======
let data = [];
let attendance = {};
let bell = new Audio("res/bell.mp3");
let permissiondenied = new Audio("res/permissiondenied.mp3");

// ====== Core Functions ======
function decrypt(string, password) {
  try {
    var x = CryptoJS.Rabbit.decrypt(string, password);
    return x.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    throw "User or password may be incorrect or try again later";
  }
}

function checkCard(x) {
  for (let i = 0; i < data.length; i++) {
    if (x == data[i]) return true;
  }
  return false;
}

function inputBox() {
  let textinput = document.getElementById("user");
  let val = textinput.value;
  let len = val.length;

  if (len == 10) {
    if (attendance[val] === true) {
      document.getElementById("output").innerHTML = "CARD ALREADY USED";
      document.getElementById("box").style.backgroundColor = "red";
      permissiondenied.play();
      setTimeout(() => (document.getElementById("user").value = ""), 800);
    } else if (checkCard(val)) {
      attendance[val] = true;
      document.getElementById("output").innerHTML = "PASS";
      document.getElementById("box").style.backgroundColor = "green";
      bell.play();
      saveAttendance(val);
    } else {
      document.getElementById("output").innerHTML = "FAIL";
      document.getElementById("box").style.backgroundColor = "red";
      permissiondenied.play();
    }

    setTimeout(() => (document.getElementById("user").value = ""), 800);
    setTimeout(() => (document.getElementById("box").style.backgroundColor = "white"), 800);
    setTimeout(() => (document.getElementById("output").innerHTML = ""), 800);
  } else if (len > 10) {
    document.getElementById("user").value = "";
  }
}

function GetData(user, password) {
  let jsonreq = new XMLHttpRequest();
  jsonreq.onload = function () {
    try {
      var responseData = this.responseText;
      var decrypted_data = decrypt(responseData, password);
      var dataJSON = JSON.parse(decrypted_data);

      if (!dataJSON[user] || dataJSON[user].length === 0) {
        alert("User or password may be incorrect or try again later");
        return;
      }

      data = dataJSON[user];
      attendance = {};
      directs();
    } catch (error) {
      alert("Invalid data or decryption failed");
      location.reload();
    }
  };

  jsonreq.open("GET", "res/data.json");
  jsonreq.send();
}

function handleSubmit(form) {
  var user = form.user.value;
  var password = form.password.value;

  if (!user || !password) {
    alert("User and password can't be empty");
    return;
  }

  GetData(user, password);
}

function directs() {
  document.querySelector("h2").innerHTML = "Id Card Tapping";
  document.getElementById("pass").setAttribute("type", "hidden");
  document.getElementById("user").value = "";
  document.getElementById("user").placeholder = "cardnumber";
  document.getElementById("user").addEventListener("input", () => inputBox());
  document.getElementById("user").focus();
  document.getElementById("sub").disabled = true;
  document.getElementById("sub").setAttribute("type", "hidden");
  document.querySelector("div").setAttribute("style", "height:190px;");

  addDownloadButton(); // Add download button here
}

// ====== Firestore Integration ======
async function saveAttendance(cardNumber) {
  try {
    await addDoc(collection(db, "attendanceRecords"), {
      cardNumber: cardNumber,
      timestamp: new Date().toISOString(),
    });
    console.log("Attendance saved for:", cardNumber);
  } catch (error) {
    console.error("Error saving attendance:", error);
  }
}

async function downloadAttendance() {
  try {
    const querySnapshot = await getDocs(collection(db, "attendanceRecords"));
    const rows = [["Card Number", "Timestamp"]];
    querySnapshot.forEach((doc) => {
      const { cardNumber, timestamp } = doc.data();
      rows.push([cardNumber, timestamp]);
    });

    let csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "attendance_data.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    alert("Error downloading data");
    console.error(error);
  }
}

// ====== UI Enhancements ======
function addDownloadButton() {
  const btn = document.createElement("button");
  btn.innerText = "⬇️ Download Attendance";
  btn.style.cssText =
    "display:block;margin:20px auto;padding:10px 20px;background:#4CAF50;color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px;";
  btn.onclick = downloadAttendance;
  document.body.appendChild(btn);
}

// Prevent submit reload
window.addEventListener("load", () => {
  document.getElementById("form").addEventListener("submit", (event) => event.preventDefault());
});
