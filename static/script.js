// ==================== MongoDB Atlas Data API Config ====================
const DATA_API_INSERT =
  "https://ap-south-1.aws.data.mongodb-api.com/app/data-abcde/endpoint/data/v1/action/insertOne";
const DATA_API_FIND =
  "https://ap-south-1.aws.data.mongodb-api.com/app/data-abcde/endpoint/data/v1/action/find";
const API_KEY = "YOUR_API_KEY_HERE"; // ⚠️ replace with your Data API key
const DATABASE = "attendanceDB";
const COLLECTION = "records";

let currentUser = "";
let data = [];
let attendance = {};

// ==================== Audio Setup ====================
const bell = new Audio("res/bell.mp3");
const permissiondenied = new Audio("res/permissiondenied.mp3");

// ==================== Handle Card Input ====================
function inputBox() {
  let textinput = document.getElementById("user");
  let val = textinput.value.trim();
  let len = val.length;

  if (len === 10) {
    // Check if already used
    if (attendance[val] === true) {
      document.getElementById("output").innerHTML = "CARD ALREADY USED";
      document.getElementById("box").style.backgroundColor = "Red";
      permissiondenied.play();
      setTimeout(() => (textinput.value = ""), 800);
    } else if (checkCard(val)) {
      attendance[val] = true;
      document.getElementById("output").innerHTML = "PASS";
      document.getElementById("box").style.backgroundColor = "Green";
      bell.play();

      // ✅ Store in MongoDB Atlas
      const payload = {
        collection: COLLECTION,
        database: DATABASE,
        dataSource: "Cluster0", // change if your cluster name differs
        document: {
          session: currentUser,
          cardNumber: val,
          timestamp: new Date().toISOString(),
        },
      };

      fetch(DATA_API_INSERT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": API_KEY,
        },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((response) => console.log("Stored:", response))
        .catch((error) => console.error("Error storing:", error));
    } else {
      document.getElementById("output").innerHTML = "FAIL";
      document.getElementById("box").style.backgroundColor = "Red";
      permissiondenied.play();
    }

    setTimeout(() => (textinput.value = ""), 800);
    setTimeout(
      () => (document.getElementById("box").style.backgroundColor = "white"),
      800
    );
    setTimeout(() => (document.getElementById("output").innerHTML = ""), 800);
  } else if (len > 10) {
    textinput.value = "";
  }
}

// ==================== Fetch & Decrypt Card Data ====================
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
      alert("User or password may be incorrect or try again later");
    }
  };
  jsonreq.open("GET", "res/data.json");
  jsonreq.send();
}

// ==================== Decrypt Function ====================
function decrypt(string, password) {
  try {
    var x = CryptoJS.Rabbit.decrypt(string, password);
    return x.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    throw "User or password may be incorrect or try again later";
  }
}

// ==================== Card Validation ====================
function checkCard(x) {
  return data.includes(x);
}

// ==================== Login Submit ====================
function handleSubmit(form) {
  var user = form.user.value.trim();
  var password = form.password.value.trim();

  if (!user || !password) {
    alert("User and password can't be empty");
    return;
  }

  currentUser = user;
  GetData(user, password);
}

// ==================== Switch UI to Attendance Mode ====================
function directs() {
  document.querySelector("h2").innerHTML = "ID Card Tapping";
  document.getElementById("pass").setAttribute("type", "hidden");
  document.getElementById("user").value = "";
  document.getElementById("user").placeholder = "cardnumber";
  document.getElementById("user").addEventListener("input", () => inputBox());
  document.getElementById("user").focus();
  document.getElementById("sub").disabled = true;
  document.getElementById("sub").setAttribute("type", "hidden");
  document.querySelector("div").style.height = "190px";
  document.getElementById("downloadBtn").style.display = "block";
}

// ==================== Download Attendance (Excel) ====================
async function downloadAttendance() {
  const payload = {
    collection: COLLECTION,
    database: DATABASE,
    dataSource: "Cluster0",
  };

  const res = await fetch(DATA_API_FIND, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": API_KEY,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!json.documents || json.documents.length === 0) {
    alert("No attendance data found.");
    return;
  }

  // Prepare data for Excel
  const records = json.documents.map((d) => ({
    Session: d.session,
    CardNumber: d.cardNumber,
    Timestamp: new Date(d.timestamp).toLocaleString(),
  }));

  const ws = XLSX.utils.json_to_sheet(records);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Attendance");
  XLSX.writeFile(wb, "attendance.xlsx");
}
