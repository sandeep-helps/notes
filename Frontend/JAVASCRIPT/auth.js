// =========================
// 🔐 AUTH.JS (FULL BACKEND INTEGRATION)
// =========================

// 🌐 Backend API base
const API_BASE = "http://localhost:5000/api";

// =========================
// 🚀 Firebase Initialization
// =========================
const firebaseConfig = {
  apiKey: "AIzaSyAO1OtrUKE_TZX2f6NVmFhfnvKlw4G2L8U",
  authDomain: "enggnotes-76d58.firebaseapp.com",
  projectId: "enggnotes-76d58",
  storageBucket: "enggnotes-76d58.appspot.com",
  messagingSenderId: "772203209048",
  appId: "1:772203209048:web:f700614d9a5880d502852d",
  measurementId: "G-C2L29VNQ7P"
};

// ✅ only ONCE initialize
firebase.initializeApp(firebaseConfig);

// =========================
// 🔁 Attach events when DOM ready
// =========================
document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginFormElement");
    const signupForm = document.getElementById("signupFormElement");

    if (loginForm) loginForm.addEventListener("submit", handleLogin);
    if (signupForm) signupForm.addEventListener("submit", handleSignup);
});

// =========================
// 🔑 LOGIN
// =========================
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    if (!email || !password) {
        showNotification("Please fill all fields", "error");
        return;
    }

    try {
        // 1️⃣ Firebase login
        const fb = await firebase.auth().signInWithEmailAndPassword(email, password);

        // 2️⃣ Firebase token
        const firebaseToken = await fb.user.getIdToken();

        // 3️⃣ Send to backend
        const res = await fetch(`${API_BASE}/auth/firebase`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firebaseToken })
        });

        const data = await res.json();

        if (!data.token) {
            showNotification("Backend login failed", "error");
            return;
        }

        // 4️⃣ Save JWT
        localStorage.setItem("jwt", data.token);

        showNotification("Login Successful", "success");

        // 5️⃣ Correct redirect for YOUR folders
        if (data.user.role === "admin") {
            window.location.href = "../HTML/admin-panel.html";
        } else {
            window.location.href = "../HTML/student-profile.html";
        }

    } catch (err) {
        console.log(err);
        showNotification("Invalid email or password", "error");
    }
}

// =========================
// 🆕 SIGNUP
// =========================
async function handleSignup(e) {
    e.preventDefault();

    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const course = document.getElementById("signup-course").value;

    if (password !== confirmPassword) {
        showNotification("Passwords do not match", "error");
        return;
    }

    try {
        const fb = await firebase.auth().createUserWithEmailAndPassword(email, password);

        await fb.user.updateProfile({ displayName: name });

        const firebaseToken = await fb.user.getIdToken();

        const res = await fetch(`${API_BASE}/auth/firebase`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firebaseToken })
        });

        const data = await res.json();

        localStorage.setItem("jwt", data.token);

        showNotification("Account created successfully", "success");

        window.location.href = "../HTML/student-profile.html";

    } catch (err) {
        console.log(err);
        showNotification("Signup failed", "error");
    }
}

// =========================
// 🚪 LOGOUT
// =========================
function logout() {
    localStorage.removeItem("jwt");
    firebase.auth().signOut();
    window.location.href = "../HTML/login.html";
}

// =========================
// 🔔 NOTIFICATIONS
// =========================
function showNotification(message, type = "info") {
    const area = document.getElementById("notificationArea");
    if (!area) return;

    const div = document.createElement("div");
    div.className = `notification notification-${type}`;
    div.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;

    area.appendChild(div);

    setTimeout(() => div.remove(), 4000);
}

function getNotificationIcon(type) {
    return {
        success: "check-circle",
        error: "exclamation-circle",
        warning: "exclamation-triangle",
        info: "info-circle"
    }[type] || "info-circle";
}
