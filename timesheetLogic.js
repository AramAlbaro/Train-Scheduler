/* global firebase moment */
// Steps to complete:

// 1. Initialize Firebase
// 2. Create button for adding new employees - then update the html + update the database
// 3. Create a way to retrieve employees from the employee database.
// 4. Create a way to calculate the months worked. Using difference between start and current time.
//    Then use moment.js formatting to set difference in months.
// 5. Calculate Total billed

// 1. Initialize Firebase
var config = {
    apiKey: "AIzaSyDT0dsP_TXLwkECm6hkQNVipCKZ0Uq6YzM",
    authDomain: "trainscheduler-ce5a3.firebaseapp.com",
    databaseURL: "https://trainscheduler-ce5a3.firebaseio.com",
    projectId: "trainscheduler-ce5a3",
    storageBucket: "trainscheduler-ce5a3.appspot.com",
    messagingSenderId: "880391145017"
  };
  firebase.initializeApp(config);

var database = firebase.database();

// 2. Button for adding Employees
$("#add-employee-btn").on("click", function(event) {
  event.preventDefault();

  // Grabs user input
  var empName = $("#employee-name-input").val().trim();
  var empRole = $("#role-input").val().trim();
  var empStart = moment($("#start-input").val().trim(), "DD/MM/YY").format("X");
  var empRate = $("#rate-input").val().trim();

  // Creates local "temporary" object for holding employee data
  var newEmp = {
    name: empName,
    role: empRole,
    start: empStart,
    rate: empRate
  };

  // Uploads employee data to the database
  database.ref('/timesheet').push(newEmp);

  // Logs everything to console
  console.log(newEmp.name);
  console.log(newEmp.role);
  console.log(newEmp.start);
  console.log(newEmp.rate);

  // Alert
  alert("Employee successfully added");

  // Clears all of the text-boxes
  $("#employee-name-input").val("");
  $("#role-input").val("");
  $("#start-input").val("");
  $("#rate-input").val("");
});

// 3. Create Firebase event for adding employee to the database and a row in the html when a user adds an entry
database.ref('/timesheet').on("child_added", function(childSnapshot, prevChildKey) {
  appendEmp(childSnapshot);
});

// Example Time Math
// -----------------------------------------------------------------------------
// Assume Employee start date of January 1, 2015
// Assume current date is March 1, 2016

// We know that this is 15 months.
// Now we will create code in moment.js to confirm that any attempt we use mets this test case

function appendEmp (snap) {
  var emp = snap.val()
  var row = $('<tr>')
  row.append($('<td>').text(emp.name))
  row.append($('<td>').text(emp.role))
  row.append($('<td>').text(emp.rate))

  var next = $('<td>')
  var away = $('<td>')
  row.append(next)
  row.append(away)
  row.on('click', removeRow)

  $("#train-table > tbody").append(row)

  updateValues()
  setInterval(updateValues, 1000)

  function updateValues () {
    // Update times every second
    var time = calculateNext(emp.start, emp.rate)
    next.text(time.format('HH:mm a'))
    away.text(moment().to(time))
  }

  function removeRow () {
    snap.ref.remove()
    row.remove()
  }
}

function calculateNext (timestamp, rate) {
  var now = moment();
  var start = moment.unix(timestamp, "X");

  if (start.isValid()) {
    var next = moment()
    .hour(start.hour())
    .minutes(start.minutes())
    .seconds(0);

    while (next.isBefore(now)) {
      next.add(rate, "minutes");
    }

    return next
  }
  return false
}
