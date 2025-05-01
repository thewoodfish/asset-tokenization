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
    } else if (e.classList.contains("gen-account-btn")) {
      if (qs(".player-name").value) {
        // Update button label
        hide(".gen-account-btn");
        appear(".gen-account-btn-1");

        fetch("/gen-keys", {
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "data": qs(".player-name").value
          })
        })
          .then(async res => {
            await res.json().then(res => {
              hide(".gen-account-btn-1");
              appear(".gen-account-btn");

              if (!res.error) {
                const ss58_addr = res.data.ss58_addr;
                clearField(".pseudo-name");
                appear(".mnemonics-container");
                toast(`You have <code class="bold">10 seconds</code> to copy your keys`);

                qs(".mnemonic-seed").innerText = res.data.seed;
                qs(".kilt-did-result").innerText = ss58_addr;
                updateAuthUser(ss58_addr, name);

                // set session nonce
                setSessionNonce(res.data.nonce);

                // set timeout to remove div
                setTimeout(() => hide(".mnemonics-container"), 10000);
              } else {
                appear(".mnemonic-error-text");
                setTimeout(() => hide(".mnemonic-error-text"), 5000);
              }
            });
          })
      } else {
        toast("Please specify your gaming name");
      }
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
      }
    } else if (e.classList.contains("list-item-x")) {
      // Tab toggling
      qsa(".list-item-x").forEach(j => {
        j.classList.remove("dark:bg-blue-600", "text-white", "bg-blue-700", "active"); // remove active classes
        // j.classList.add(
        //   'hover:text-gray-900',
        //   'bg-gray-50',
        //   'hover:bg-gray-100',
        //   'w-full',
        //   'dark:bg-gray-800',
        //   'dark:hover:bg-gray-700',
        //   'dark:hover:text-white'
        // );
      });

      // Highlight the clicked button (e is the clicked element)
      e.classList.remove(
        'hover:text-gray-900',
        'bg-gray-50',
        'hover:bg-gray-100',
        'dark:bg-gray-800',
        'dark:hover:bg-gray-700',
        'dark:hover:text-white'
      );

      e.classList.add("dark:bg-blue-600", "text-white", "bg-blue-700", "active");

      // Show/hide tabs
      qsa(".list-tab-x").forEach(j => {
        j.classList.add("hidden");
        if (j.dataset.index === e.dataset.index) {
          j.classList.remove("hidden");
        }
      });
    } else {
      toast(`Please fill out all fields`);
    }
  }, false);


function toast(message, duration = 3000) {
  qs(".toast-msg").innerText = message;
  appear(".toast-div");
  setTimeout(() => {
    hide(".toast-div");
  }, duration);
}