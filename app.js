const storage = {
  read(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  },
  write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const packages = [
  {
    image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1000&q=85",
    place: "United States",
    description: "Explore New York, national parks, coastlines, and the Grand Canyon in one varied adventure.",
    price: 999
  },
  {
    image: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1000&q=85",
    place: "China",
    description: "Visit the Great Wall, imperial palaces, lively cities, and classic regional food streets.",
    price: 999
  },
  {
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=85",
    place: "Greece",
    description: "Experience ancient Athens, blue island views, beaches, and Mediterranean cuisine.",
    price: 999
  },
  {
    image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1000&q=85",
    place: "Italy",
    description: "Discover Rome, Florence, Venice, Renaissance art, gelato, pasta, and old city streets.",
    price: 999
  },
  {
    image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1000&q=85",
    place: "France",
    description: "See Paris landmarks, countryside towns, museums, bakeries, and relaxed cafe culture.",
    price: 999
  },
{
  image: "https://images.unsplash.com/photo-1548786811-dd6e453ccca7?auto=format&fit=crop&w=1000&q=85",
  place: "Jordan",
  description: "Explore Petra, Wadi Rum, the Dead Sea, desert camps, castles, and historic trails.",
  price: 999
},
  {
    image: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=1000&q=85",
    place: "Mexico",
    description: "Enjoy beaches, Mayan ruins, colorful cities, markets, and unforgettable local food.",
    price: 999
  },
  {
    image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1000&q=85",
    place: "Spain",
    description: "Visit Barcelona, Madrid, sunny coasts, historic plazas, architecture, and tapas bars.",
    price: 999
  }
];

function setMessage(element, text, isSuccess = false) {
  if (!element) return;
  element.textContent = text;
  element.classList.toggle("success", isSuccess);
}

function wireSignup() {
  const form = document.getElementById("signupForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = document.getElementById("signupMessage");
    const data = Object.fromEntries(new FormData(form));
    const users = storage.read("users", []);

    if (users.some((user) => user.email.toLowerCase() === data.email.toLowerCase())) {
      setMessage(message, "Email Already Exists");
      return;
    }

    if (data.password !== data.confirmPassword) {
      setMessage(message, "Password do not match");
      return;
    }

    users.push({
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password
    });
    storage.write("users", users);
    setMessage(message, "Signup Successfully. You can sign in now.", true);
    form.reset();
  });
}

function wireSignin() {
  const form = document.getElementById("signinForm");
  const guestLogin = document.getElementById("guestLoginBtn");

  if (guestLogin) {
    guestLogin.addEventListener("click", () => {
      localStorage.removeItem("activeUser", "Guest");
      window.location.assign("main.html");
    });
  }

  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = document.getElementById("signinMessage");
    const data = Object.fromEntries(new FormData(form));
    const users = storage.read("users", []);
    const foundUser = users.find((user) => user.email === data.email && user.password === data.password);

    if (!foundUser) {
      setMessage(message, "Invalid Email or Password");
      return;
    }

    storage.write("userinfo", [{ name: foundUser.name, email: foundUser.email }]);
    setMessage(message, "Login Successfully", true);
    window.setTimeout(() => window.location.assign("main.html"), 350);
  });
}

function renderPackages() {
  const packageGrid = document.getElementById("packageGrid");
  if (!packageGrid) return;

  packageGrid.innerHTML = packages.map((item, index) => `
    <article class="package-card">
      <img src="${item.image}" alt="${item.place} travel package">
      <div class="package-body">
        <h3>${item.place}</h3>
        <p>${item.description}</p>
        <div class="rating" aria-label="Five star rating">5.0 traveler rating</div>
        <h4>Price: $${item.price}</h4>
        <button type="button" data-package-index="${index}">Book Now</button>
      </div>
    </article>
  `).join("");

  packageGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-package-index]");
    if (!button) return;

    const selectedPackage = packages[Number(button.dataset.packageIndex)];
    storage.write("packageInfo", selectedPackage);
    const destination = document.getElementById("destinationField");
    if (destination) destination.value = selectedPackage.place;
    document.getElementById("book")?.scrollIntoView({ behavior: "smooth" });
  });
}

function wireMainPage() {
  const activeUser = document.getElementById("activeUser");
  if (!activeUser) return;

  // Guest user
  const guestUser = localStorage.getItem("activeUser");
  if (guestUser) {
    activeUser.textContent = guestUser;
  }

  // Signed in user
  const userInfo = storage.read("userinfo", null);
  if (userInfo?.[0]?.name) {
    activeUser.textContent = userInfo[0].name;
  }

  // Selected package
  const selectedPackage = storage.read("packageInfo", null);
  const destination = document.getElementById("destinationField");

  if (destination && selectedPackage?.place) {
    destination.value = selectedPackage.place;
  }

  // Logout button
  const logoutBtn = document.getElementById("logoutButton");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("userinfo");
      localStorage.removeItem("activeUser");

      window.location.href = "index.html";
    });
  }
}

function wireBooking() {
  const form = document.getElementById("bookingForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const bookings = storage.read("bookinginfo", []);
    bookings.push(Object.fromEntries(new FormData(form)));
    storage.write("bookinginfo", bookings);
    setMessage(document.getElementById("bookingMessage"), "Booking is Successfully saved.", true);
    form.reset();
  });
}

function wireContact() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const contacts = storage.read("contactInfo", []);
    contacts.push(Object.fromEntries(new FormData(form)));
    storage.write("contactInfo", contacts);
    setMessage(document.getElementById("contactMessage"), "Submitted Successfully.", true);
    form.reset();
  });
}

wireSignup();
wireSignin();
wireMainPage();
renderPackages();
wireBooking();
wireContact();
