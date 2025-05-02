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

function clearField(attr) {
  qs(attr).value = "";
}

function appear(attr) {
  qs(attr).classList.remove("hidden");
}

function hide(attr) {
  if (!qs(attr).classList.contains("hidden")) qs(attr).classList.add("hidden");
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
            method: "get",
            headers: {
              "Content-Type": "application/json",
            },
          }).then(async (res) => {
            await res.json().then((res) => { });
          });
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
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: qs(".player-name").value,
          }),
        }).then(async (res) => {
          await res.json().then((res) => {
            hide(".gen-account-btn-1");
            appear(".gen-account-btn");

            if (!res.error) {
              clearField(".player-name");
              appear(".mnemonics-div");
              toast(
                `You have <code class="bold">10 seconds</code> to copy your keys`
              );

              qs(".mnemonics").innerText = res.data.seed;

              // set timeout to remove div
              setTimeout(() => hide(".mnemonics-div"), 10000);
            } else {
              toast("Could not create your account. Try again later");
            }
          });
        });
      } else {
        toast("Please specify your gaming name");
      }
    } else if (e.classList.contains("reg-assets-btn")) {
      let allFilled = true;
      let gameInputs = qsa(".asset-info-x");
      let assetData = [];

      gameInputs.forEach((e) => {
        assetData.push(e.value);
        if (!e.value) allFilled = false;
      });

      if (allFilled) {
         // Update button label
         hide(".reg-assets-btn");
         appear(".reg-assets-btn-1");
         
        fetch("/register-asset", {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: assetData.join("$$$"),
          }),
        }).then(async (res) => {
          await res.json().then((res) => {
            toast(res.data);
           });
        });
      } else {
        toast("Please input all fields");
      }
    } else if (e.classList.contains("buy-game-assets")) {
      // Fetch game assets
      fetch("/get-assets", {
        method: "get",
        headers: {
          "Content-Type": "application/json",
        }
      }).then(async (res) => {
        await res.json().then((res) => {
          
         });
      });
    } else if (e.classList.contains("list-item-x")) {
      // Tab toggling
      qsa(".list-item-x").forEach((j) => {
        j.classList.remove(
          "dark:bg-blue-600",
          "text-white",
          "bg-blue-700",
          "active"
        ); // remove active classes
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
        "hover:text-gray-900",
        "bg-gray-50",
        "hover:bg-gray-100",
        "dark:bg-gray-800",
        "dark:hover:bg-gray-700",
        "dark:hover:text-white"
      );

      e.classList.add(
        "dark:bg-blue-600",
        "text-white",
        "bg-blue-700",
        "active"
      );

      // Show/hide tabs
      qsa(".list-tab-x").forEach((j) => {
        j.classList.add("hidden");
        if (j.dataset.index === e.dataset.index) {
          j.classList.remove("hidden");
        }
      });
    } else if (e.classList.contains("copy-to-clipboard")) {
      // copy to clipboard
      let copy_text = qs(`.${e.dataset.target}`).innerText;

      if (!navigator.clipboard) toast("Clipboard API not supported");

      navigator.clipboard.writeText(copy_text).then(
        () => {
          toast("Text copied to clipboard!");
        },
        () => {
          toast("Failed to copy text to clipboard");
        }
      );
    }
  },
  false
);

function toast(message, duration = 3000) {
  qs(".toast-msg").innerText = message;
  appear(".toast-div");
  setTimeout(() => {
    hide(".toast-div");
  }, duration);
}

function copyMnemonics() {
  const words = Array.from(document.querySelectorAll("#mnemonics div"))
    .map((div) => div.textContent)
    .join(" ");
  navigator.clipboard.writeText(words).then(() => {
    toast("Mnemonics copied to clipboard!");
  });
}
