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
            hide(".reg-assets-btn-1");
            appear(".reg-assets-btn");
            toast(res.data);
          });
        });
      } else {
        toast("Please input all fields");
      }
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

      if (e.classList.contains("buy-game-assets")) {
        // Fetch games
        fetch("/get-games", {
          method: "get",
          headers: {
            "Content-Type": "application/json",
          }
        }).then(async (res) => {
          await res.json().then((res) => {
            if (!res.error) {
              let games = res.data.split("$");
              qs("#games").innerHTML = "<option selected>Select games</option>";


              games.forEach((e) => {
                if (e.length > 1) {
                  qs("#games").innerHTML += `<option value='${e}'>${e}</option>`
                }
              });
            } else {
              toast("Could not fetch games");
            }
          });
        });
      }

      if (e.classList.contains("gift-game-assets")) {
        // Fetch games
        fetch("/get-games", {
          method: "get",
          headers: {
            "Content-Type": "application/json",
          }
        }).then(async (res) => {
          await res.json().then((res) => {
            if (!res.error) {
              let games = res.data.split("$");
              qs("#gift-game").innerHTML = "<option selected>Select games</option>";


              games.forEach((e) => {
                if (e.length > 1) {
                  qs("#gift-game").innerHTML += `<option value='${e}'>${e}</option>`
                }
              });
            } else {
              toast("Could not fetch games");
            }
          });
        });
      }

      if (e.classList.contains("gift-game-assets")) {
        // Fetch games
        fetch("/get-games", {
          method: "get",
          headers: {
            "Content-Type": "application/json",
          }
        }).then(async (res) => {
          await res.json().then((res) => {
            if (!res.error) {
              let games = res.data.split("$");
              qs("#gift-game").innerHTML = "<option selected>Select games</option>";


              games.forEach((e) => {
                if (e.length > 1) {
                  qs("#gift-game").innerHTML += `<option value='${e}'>${e}</option>`
                }
              });
            } else {
              toast("Could not fetch games");
            }
          });
        });
      }

      if (e.classList.contains("trade-game-asset")) {
        // Fetch games
        fetch("/get-games", {
          method: "get",
          headers: {
            "Content-Type": "application/json",
          }
        }).then(async (res) => {
          await res.json().then((res) => {
            if (!res.error) {
              let games = res.data.split("$");
              qs(".select-game-card").innerHTML = "<option selected>Select games</option>";
              qs(".select-game-card-1").innerHTML = "<option selected>Select games</option>";


              games.forEach((e) => {
                if (e.length > 1) {
                  qs(".select-game-card").innerHTML += `<option value='${e}'>${e}</option>`
                  qs(".select-game-card-1").innerHTML += `<option value='${e}'>${e}</option>`
                }
              });
            } else {
              toast("Could not fetch games");
            }
          });
        });
      }
    } else if (e.classList.contains("buy-asset-btn")) {
      let allFilled = true;
      let gameInputs = qsa(".buy-asset-field");
      let assetData = [];

      gameInputs.forEach((e) => {
        assetData.push(e.value);
        if (!e.value || e.value.includes("Select")) allFilled = false;
      });

      if (allFilled) {
        // Update button label
        hide(".buy-asset-btn");
        appear(".buy-asset-btn-1");

        fetch("/buy-asset", {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: assetData.join("$$$"),
          }),
        }).then(async (res) => {
          await res.json().then((res) => {
            hide(".buy-asset-btn-1");
            appear(".buy-asset-btn");
            toast(res.data);
          });
        });
      } else {
        toast("Please input all fields");
      }
    } else if (e.classList.contains("gift-asset-btn")) {
      let allFilled = true;
      let gameInputs = qsa(".gift-form");
      let assetData = [];

      gameInputs.forEach((e) => {
        assetData.push(e.value);
        if (!e.value) allFilled = false;
      });

      if (allFilled) {
        // Update button label
        hide(".gift-asset-btn");
        appear(".gift-asset-btn-1");

        fetch("/gift-asset", {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: assetData.join("$$$"),
          }),
        }).then(async (res) => {
          await res.json().then((res) => {
            hide(".gift-asset-btn-1");
            appear(".gift-asset-btn");
            toast(res.data);
          });
        });
      } else {
        toast("Please input all fields");
      }
    } else if (e.classList.contains("xchange-btn")) {
      let allFilled = true;
      let gameInputs = qsa(".xchange-form");
      let assetData = [];

      gameInputs.forEach((e) => {
        assetData.push(e.value);
        if (!e.value) allFilled = false;
      });

      if (allFilled) {
        // Update button label
        hide(".xchange-btn");
        appear(".xchange-btn-1");

        fetch("/swap-assets", {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: assetData.join("$$$"),
          }),
        }).then(async (res) => {
          await res.json().then((res) => {
            hide(".xchange-btn-1");
            appear(".xchange-btn");
            toast(res.data);
          });
        });
      } else {
        toast("Please input all fields");
      }
    } else if (e.classList.contains("auth-btn-x")) {
      let keys = qs(".auth-keys");

      if (keys.value && keys.value.split(" ").length == 12) {
        // Update button label
        hide(".auth-btn-x");
        appear(".auth-btn-x-1");

        fetch("/auth", {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            keys: keys.value,
          }),
        }).then(async (res) => {
          await res.json().then((res) => {
            hide(".auth-btn-x-1");
            appear(".auth-btn-x");
            toast(res.data);
          });
        });
      } else {
        toast("Please enter your 12 seed phrase");
      }
    } else if (e.classList.contains("auth-btn-x")) {
      let keys = qs(".auth-keys");

      if (keys.value && keys.value.split(" ").length == 12) {
        // Update button label
        hide(".auth-btn-x");
        appear(".auth-btn-x-1");

        fetch("/auth", {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            keys: keys.value,
          }),
        }).then(async (res) => {
          await res.json().then((res) => {
            hide(".auth-btn-x-1");
            appear(".auth-btn-x");
            toast(res.data);
          });
        });
      } else {
        toast("Please enter your 12 seed phrase");
      }
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

document.body.addEventListener(
  "change",
  (e) => {
    e = e.target;
    if (e.classList.contains("games-selector")) {
      fetch("/get-assets", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: e.value
        }),
      }).then(async (res) => {
        await res.json().then((res) => {
          if (!res.error) {
            let games = res.data.split("$");
            qs("#assets").innerHTML = "<option selected>Select asset</option>";


            games.forEach((e) => {
              if (e.length > 1) {
                qs("#assets").innerHTML += `<option value='${e}'>${e}</option>`
              }
            });
          } else {
            toast("Could not fetch game assets");
          }
        });
      });
    } else if (e.classList.contains("gift-selector")) {
      fetch("/get-assets", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: e.value
        }),
      }).then(async (res) => {
        await res.json().then((res) => {
          if (!res.error) {
            let games = res.data.split("$");
            qs("#gift-asset").innerHTML = "<option selected>Select asset</option>";


            games.forEach((e) => {
              if (e.length > 1) {
                qs("#gift-asset").innerHTML += `<option value='${e}'>${e}</option>`
              }
            });
          } else {
            toast("Could not fetch game assets");
          }
        });
      });
    } else if (e.classList.contains("select-game-card")) {
      fetch("/get-assets", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: e.value
        }),
      }).then(async (res) => {
        await res.json().then((res) => {
          if (!res.error) {
            let games = res.data.split("$");
            qs(".select-asset-card").innerHTML = "<option selected>Select asset</option>";

            games.forEach((e) => {
              if (e.length > 1) {
                qs(".select-asset-card").innerHTML += `<option value='${e}'>${e}</option>`
              }
            });
          } else {
            toast("Could not fetch game assets");
          }
        });
      });
    } else if (e.classList.contains("select-game-card-1")) {
      fetch("/get-assets", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: e.value
        }),
      }).then(async (res) => {
        await res.json().then((res) => {
          if (!res.error) {
            let games = res.data.split("$");
            qs(".select-asset-card-1").innerHTML = "<option selected>Select asset</option>";

            games.forEach((e) => {
              if (e.length > 1) {
                qs(".select-asset-card-1").innerHTML += `<option value='${e}'>${e}</option>`
              }
            });
          } else {
            toast("Could not fetch game assets");
          }
        });
      });
    }
  },
  false);

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
