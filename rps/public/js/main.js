// Copyright (c) 2024 Algorealm, Inc.

function qs(tag) {
  return document.querySelector(tag);
}

function qsa(tag) {
  return document.querySelectorAll(tag);
}

function ce(tag) {
  return document.createElement(tag);
}


function appear(attr) {
  qs(attr).classList.remove("hidden");
}

function hide(attr) {
  if (!qs(attr).classList.contains("hidden"))
    qs(attr).classList.add("hidden");
}
function updateText(html, text) {
  html.innerText = text;
}

// Capture and react to all click events
document.body.addEventListener(
  "click",
  (e) => {
    e = e.target;
    if (e.classList.contains("auth-btn")) {
      let auth = qs(".auth-input");
      if (auth.value) {
        // Check that they are 12
        if (auth.value.split(" ").length == 12) {
          // Prepare to send it to the backend
          fetch("/auth", {
            method: 'get',
            headers: {
              'Content-Type': 'application/json'
            },
          })
            .then(async res => {
              await res.json().then(res => {

              });
            })
        } else {
          toast("Invalid number of words in mnemonics.");
        }
      } else {
        toast("Please fill in valid 12 seed mnemonics.");
      }
    } else if (e.classList.contains("generate-btn")) {
      // Update button label
      updateText(e, "Generating new account...");
      e.disabled = true;
      fetch("/gen-keys", {
        method: 'get',
        headers: {
          'Content-Type': 'application/json'
        },
      })
        .then(async res => {
          await res.json().then(res => {

          });
        })
    } else if (e.classList.contains("submit-asset-btn")) {
      let allFilled = true;
      let gameInputs = qsa(".game-input");
      let assetData = [];

      gameInputs.forEach(e => {
        assetData.push(e.value);
        if (!e.value)
          allFilled = false;
      });



      if (allFilled) {
        // Update button label
        updateText(e, "Registering...");
        e.disabled = true;
        fetch("/register-asset", {
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "data": assetData.join("$$$")
          })
        })
          .then(async res => {
            await res.json().then(res => {

            });
          })
      } else {
        toast(`❌ Please fill out all fields`);
      }
    }
  }, false);


function toast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}