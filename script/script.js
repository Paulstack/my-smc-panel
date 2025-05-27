// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB67fFNFiHMYZqgnV3LDT4GNU9WUHKdCXY",
  authDomain: "my-smc-panel.firebaseapp.com",
  projectId: "my-smc-panel",
  storageBucket: "my-smc-panel.appspot.com",
  messagingSenderId: "530807938141",
  appId: "1:530807938141:web:9f33702985a6476783c1b4"
};

// Initialize Firebase (compat version)
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const ADMIN_EMAIL = "polsaint4@gmail.com"; // Replace with your admin email

function loadEarnings() {
  const user = auth.currentUser;
  if (!user) return;
  db.collection("users").doc(user.uid).get().then(doc => {
    const data = doc.data() || {};
    if (document.getElementById("earnings")) {
      document.getElementById("earnings").textContent = `₦${data.earnings || 0}`;
    }
  });
}

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      alert("Logged in!");
      loadEarnings();
    })
    .catch(error => {
      alert("Login failed: " + error.message);
    });
}

function register() {
  const name = document.getElementById("name").value.trim();
  const whatsapp = document.getElementById("whatsapp").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!name || !whatsapp || !email || !password) {
    alert("Please fill in all fields before registering.");
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Save extra info to Firestore
      return db.collection("users").doc(userCredential.user.uid).set({
        name: name,
        whatsapp: whatsapp,
        email: email,
        earnings: 0,
        completed: []
      });
    })
    .then(() => {
      alert("Registered!");
      loadEarnings();
    })
    .catch(error => {
      alert("Registration failed: " + error.message);
    });
}

function logout() {
  auth.signOut().then(() => {
    alert("Logged out");
    if (document.getElementById("earnings")) {
      document.getElementById("earnings").textContent = "₦0";
    }
    if (document.getElementById("admin-panel")) {
      document.getElementById("admin-panel").style.display = "none";
    }
  });
}

function resetEarnings() {
  if (!confirm("Are you sure you want to reset all users' earnings?")) return;
  db.collection("users").get().then(snapshot => {
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, { earnings: 0 });
    });
    return batch.commit();
  }).then(() => {
    alert("All earnings have been reset.");
    loadEarnings();
  });
}

function forgotPassword() {
  const email = document.getElementById("email").value;
  if (!email) {
    alert("Please enter your email address above first.");
    return;
  }
  auth.sendPasswordResetEmail(email)
    .then(() => {
      alert("Password reset email sent! Please check your inbox.");
    })
    .catch(error => {
      alert("Error: " + error.message);
    });
}

function updateUserInfo() {
  const name = document.getElementById("update-name").value.trim();
  const whatsapp = document.getElementById("update-whatsapp").value.trim();
  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to update your info.");
    return;
  }
  if (!name || !whatsapp) {
    alert("Please fill in both fields to update your info.");
    return;
  }
  db.collection("users").doc(user.uid).update({
    name: name,
    whatsapp: whatsapp
  }).then(() => {
    alert("Information updated!");
    // Optionally, update the main form fields as well
    document.getElementById("name").value = name;
    document.getElementById("whatsapp").value = whatsapp;
  }).catch(error => {
    alert("Update failed: " + error.message);
  });
}

// Show/hide admin panel and load earnings on auth state change
auth.onAuthStateChanged(user => {
  if (user) {
    loadEarnings();
    if (user.email === ADMIN_EMAIL && document.getElementById("admin-panel")) {
      document.getElementById("admin-panel").style.display = "block";
    } else if (document.getElementById("admin-panel")) {
      document.getElementById("admin-panel").style.display = "none";
    }
    document.getElementById("update-info").style.display = "block";
    // Optionally, prefill update fields
    db.collection("users").doc(user.uid).get().then(doc => {
      const data = doc.data() || {};
      document.getElementById("update-name").value = data.name || "";
      document.getElementById("update-whatsapp").value = data.whatsapp || "";
    });
  } else {
    if (document.getElementById("earnings")) {
      document.getElementById("earnings").textContent = "₦0";
    }
    if (document.getElementById("admin-panel")) {
      document.getElementById("admin-panel").style.display = "none";
    }
    document.getElementById("update-info").style.display = "none";
  }
});

// Optionally, load earnings on page load if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
  if (auth.currentUser) {
    loadEarnings();
  }
});