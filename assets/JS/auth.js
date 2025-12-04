(function () {
  const container = document.querySelector(".content__card__userinput");
  if (!container) return;

  function render(mode) {
    if (mode === "signup") {
      container.innerHTML = `
        <form id="authForm" class="auth-form">
          <div class="auth-field"><label>Full name</label><div class="input-with-icon"><span class="icon">👤</span><input id="name" type="text" required/></div></div>
          <div class="auth-field"><label>Email Address*</label><div class="input-with-icon"><span class="icon">✉️</span><input id="email" type="email" required/></div></div>
          <div class="auth-field"><label>Password*</label><div class="input-with-icon"><span class="icon">🔒</span><input id="password" type="password" required/></div></div>
          <div class="auth-actions"><button type="button" class="btn-help">❔ Help?</button><button type="submit" class="btn-next">Next Step</button></div>
        </form>`;
    } else {
      container.innerHTML = `
        <form id="authForm" class="auth-form">
          <div class="auth-field"><label>Email Address*</label><div class="input-with-icon"><span class="icon">✉️</span><input id="email" type="email" required/></div></div>
          <div class="auth-field"><label>Password*</label><div class="input-with-icon"><span class="icon">🔒</span><input id="password" type="password" required/></div></div>
          <div class="auth-actions"><button type="button" class="btn-help">❔ Help?</button><button type="submit" class="btn-next">Next Step</button></div>
        </form>`;
    }
    bind();
  }

  function bind() {
    const form = document.getElementById("authForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const nameEl = document.getElementById("name");
      if (nameEl) {
        const name = nameEl.value.trim();
        if (!name || !email || !password) {
          alert("Please fill all fields");
          return;
        }
        const user = { name, email, password };
        localStorage.setItem("tm_user", JSON.stringify(user));
        window.location.href = "/dashboad.html";
      } else {
        const raw = localStorage.getItem("tm_user");
        if (!raw) {
          alert("No user found. Please sign up first.");
          return;
        }
        try {
          const u = JSON.parse(raw);
          if (u.email === email && u.password === password) {
            window.location.href = "/dashboad.html";
          } else alert("Invalid credentials");
        } catch (e) {
          alert("Invalid user data");
        }
      }
    });

    const help = container.querySelector(".btn-help");
    if (help) help.addEventListener("click", () => alert("Help is on the way"));
  }

  const loginBtn = document.querySelector(
    ".content__card__select__button.login"
  );
  const signupBtn = document.querySelector(
    ".content__card__select__button.signup"
  );
  if (loginBtn)
    loginBtn.addEventListener("click", () => {
      setActive(loginBtn);
      render("login");
    });
  if (signupBtn)
    signupBtn.addEventListener("click", () => {
      setActive(signupBtn);
      render("signup");
    });

  function setActive(btn) {
    document
      .querySelectorAll(".content__card__select__button")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  }

  setTimeout(() => {
    if (loginBtn) {
      setActive(loginBtn);
      render("login");
    } else render("login");
  }, 100);
})();
