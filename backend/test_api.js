const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const API_BASE = "http://localhost:5001/api";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log("=== STARTING API TESTS ===");

  const phone = "+2519" + Math.floor(10000000 + Math.random() * 90000000);
  let token = "";
  let user = null;
  let verifiedListingId = null;

  // 1. REGISTER
  try {
    console.log(`\n1. Registering farmer with phone: ${phone}...`);
    const regRes = await axios.post(`${API_BASE}/auth/register`, {
      fullName: "Automated Tester",
      phoneNumber: phone,
      password: "password123",
      region: "Oromia",
      woreda: "Jimma"
    });
    console.log("Register Response:", regRes.data);
  } catch (err) {
    console.error("Register Failed:", err.response?.data || err.message);
    process.exit(1);
  }

  // 2. LOGIN
  try {
    console.log("\n2. Logging in...");
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      phoneNumber: phone,
      password: "password123"
    });
    console.log("Login Response:", loginRes.data);
    user = loginRes.data.user;
    token = "dummy-token-jwt-" + user.id;
  } catch (err) {
    console.error("Login Failed:", err.response?.data || err.message);
    process.exit(1);
  }

  const authHeaders = { Authorization: `Bearer ${token}` };

  // 3. CREATE LISTING WITHOUT IMAGE
  try {
    console.log("\n3. Creating listing without image...");
    const form = new FormData();
    form.append("cropType", "Wheat");
    form.append("quantity", "100");
    form.append("unit", "kg");
    form.append("expectedPrice", "1500");
    form.append("location", "Jimma");
    form.append("harvestDate", "2026-07-01");

    const res = await axios.post(`${API_BASE}/market/listings`, form, {
      headers: { ...authHeaders, ...form.getHeaders() }
    });
    console.log("Success (No Image):", res.data.message);
  } catch (err) {
    console.error("Failed (No Image):", err.response?.data || err.message);
  }

  // 4. CREATE LISTING WITH NON-CROP IMAGE (Expected: "not crop img")
  try {
    console.log("\n4. Creating listing with non-crop image (sports car)...");
    const form = new FormData();
    form.append("cropType", "Wheat");
    form.append("quantity", "200");
    form.append("unit", "kg");
    form.append("expectedPrice", "2000");
    form.append("location", "Jimma");
    form.append("harvestDate", "2026-07-01");
    form.append("images", fs.createReadStream(path.join(__dirname, "../test-images/red_sports_car.png")));

    await axios.post(`${API_BASE}/market/listings`, form, {
      headers: { ...authHeaders, ...form.getHeaders() }
    });
    console.error("Error: Expected request to fail but it succeeded!");
  } catch (err) {
    console.log("Expected Failure Response:", err.response?.data || err.message);
    if (err.response?.data?.error === "not crop img") {
      console.log("✅ Passed: Got 'not crop img' error message.");
    } else {
      console.error("❌ Failed: Did not get expected error message.");
    }
  }

  // 5. CREATE LISTING WITH MISMATCHED CROP IMAGE (Expected: success but message "unqulfied crop")
  try {
    console.log("\n5. Creating listing with mismatched crop image (wheat image for Coffee crop)...");
    const form = new FormData();
    form.append("cropType", "Coffee");
    form.append("quantity", "200");
    form.append("unit", "kg");
    form.append("expectedPrice", "2500");
    form.append("location", "Jimma");
    form.append("harvestDate", "2026-07-01");
    form.append("images", fs.createReadStream(path.join(__dirname, "../test-images/real_wheat_crop.png")));

    const res = await axios.post(`${API_BASE}/market/listings`, form, {
      headers: { ...authHeaders, ...form.getHeaders() }
    });
    console.log("Response:", res.data);
    if (res.data.message === "unqulfied crop" && !res.data.listing.qualityBadge) {
      console.log("✅ Passed: Listing created without badge and returned 'unqulfied crop'.");
    } else {
      console.error("❌ Failed: Did not get 'unqulfied crop' message or listing has badge.");
    }
  } catch (err) {
    console.error("❌ Failed: Listing creation failed completely:", err.response?.data || err.message);
  }

  // 6. CREATE LISTING WITH BLURRY IMAGE (Expected: "low resolution img take another pic and try again")
  try {
    console.log("\n6. Creating listing with blurry crop image...");
    const form = new FormData();
    form.append("cropType", "Wheat");
    form.append("quantity", "200");
    form.append("unit", "kg");
    form.append("expectedPrice", "3000");
    form.append("location", "Jimma");
    form.append("harvestDate", "2026-07-01");
    form.append("images", fs.createReadStream(path.join(__dirname, "../test-images/blurry_crop.png")));

    await axios.post(`${API_BASE}/market/listings`, form, {
      headers: { ...authHeaders, ...form.getHeaders() }
    });
    console.error("Error: Expected request to fail but it succeeded!");
  } catch (err) {
    console.log("Expected Failure Response:", err.response?.data || err.message);
    if (err.response?.data?.error === "low resolution img take another pic and try again") {
      console.log("✅ Passed: Got 'low resolution img take another pic and try again' error message.");
    } else {
      console.error("❌ Failed: Did not get expected error message.");
    }
  }

  // 7. CREATE LISTING WITH VALID IMAGE (Expected success + badge)
  try {
    console.log("\n7. Creating listing with valid wheat crop image...");
    const form = new FormData();
    form.append("cropType", "Wheat");
    form.append("quantity", "50");
    form.append("unit", "kg");
    form.append("expectedPrice", "1800");
    form.append("location", "Jimma");
    form.append("harvestDate", "2026-07-01");
    form.append("images", fs.createReadStream(path.join(__dirname, "../test-images/real_wheat_crop.png")));

    const res = await axios.post(`${API_BASE}/market/listings`, form, {
      headers: { ...authHeaders, ...form.getHeaders() }
    });
    console.log("Success Response:", res.data);
    if (res.data.message === "congra u got the badge") {
      console.log("✅ Passed: Got badge success message!");
      verifiedListingId = res.data.listing._id;
    } else {
      console.error("❌ Failed: Message was not 'congra u got the badge'");
    }
  } catch (err) {
    console.error("Failed:", err.response?.data || err.message);
  }

  // 8. TEST PHONE NUMBER MASKING
  if (verifiedListingId) {
    // A. Anonymous fetch
    try {
      console.log("\n8a. Fetching listing anonymously...");
      const res = await axios.get(`${API_BASE}/market/listings/${verifiedListingId}`);
      console.log("Anonymous Listing Info (phoneNumber):", res.data.phoneNumber);
      console.log("Anonymous Farmer Info (phoneNumber):", res.data.farmer?.phoneNumber);
      if (res.data.phoneNumber === "Hidden (Log in to view)" && res.data.farmer?.phoneNumber === "Hidden (Log in to view)") {
        console.log("✅ Passed: Phone number is successfully hidden for visitors.");
      } else {
        console.error("❌ Failed: Phone number is visible to visitors!");
      }
    } catch (err) {
      console.error("Failed:", err.message);
    }

    // B. Authenticated fetch
    try {
      console.log("\n8b. Fetching listing as logged-in user...");
      const res = await axios.get(`${API_BASE}/market/listings/${verifiedListingId}`, {
        headers: authHeaders
      });
      console.log("Authenticated Listing Info (phoneNumber):", res.data.phoneNumber);
      console.log("Authenticated Farmer Info (phoneNumber):", res.data.farmer?.phoneNumber);
      if (res.data.phoneNumber !== "Hidden (Log in to view)" && res.data.farmer?.phoneNumber !== "Hidden (Log in to view)") {
        console.log("✅ Passed: Phone number is successfully visible to authenticated users.");
      } else {
        console.error("❌ Failed: Phone number is hidden for authenticated users!");
      }
    } catch (err) {
      console.error("Failed:", err.message);
    }
  }

  console.log("\n=== TESTS COMPLETED ===");
}

runTests();
