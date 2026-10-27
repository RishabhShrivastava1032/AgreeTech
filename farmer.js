document.addEventListener("DOMContentLoaded", () => {
   
    // Sidebar Menu & Section Switching Logic
    const sidebarItems = document.querySelectorAll(".sidebar-menu li");
    
    sidebarItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            sidebarItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
            const targetId = item.getAttribute("data-target");
            if (targetId) {
                console.log(`Switched to section: ${targetId}`);
            }
        });
    });

    
    // 1. Live Search Bar Functionality
    const searchInput = document.querySelector(".search-bar input");
    const eqCards = document.querySelectorAll(".Equipments-grid .eq-card");
    
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            eqCards.forEach(card => {
                const titleElement = card.querySelector("h4") || card.querySelector("h3");
                const descElement = card.querySelector("p");
                const title = titleElement ? titleElement.textContent.toLowerCase() : "";
                const desc = descElement ? descElement.textContent.toLowerCase() : "";

                if (title.includes(query) || desc.includes(query)) {
                    card.style.display = "flex";
                } else {
                    card.style.display = "none";
                }
            });
        });
    }

    // 2. Filter Equipments by Category
    const filterButtons = document.querySelectorAll(".btn-filter");
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const category = btn.textContent.trim().toLowerCase();
            const cards = document.querySelectorAll(".Equipments-grid .eq-card");

            cards.forEach(card => {
                const text =  card.textContent.toLowerCase();
                if (category === "all" || text.includes(category)) {
                    card.style.display = "flex";
                } else {
                    card.style.display = "none"
                }
            });
        });
    });

    // Function to load dynamic bookings on page load
async function loadBookings() {
    try {
        const response = await fetch('http://localhost:5000/api/bookings');
        const data = await response.json();
        
        if (data.success && data.bookings.length > 0) {
            const bookingBoxes = document.querySelectorAll('.right-sidebar .card-box');
            if (bookingBoxes.length > 0) {
                const bookingBox = bookingBoxes[0]; // "My Bookings" card box
                let html = '<h4>My Bookings</h4>';
                
                data.bookings.forEach(b => {
                    html += `
                        <div class="booking-item" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 13px;">
                            <div><i class="fa-solid fa-calendar"></i> ${b.Equipments_name} (${b.duration} Days)</div>
                            <span class="status-otp" style="background:#e8f5e9; color:#2e7d32; padding:3px 8px; border-radius:4px; font-weight:600;">Confirmed</span>
                        </div>
                    `;
                });
                bookingBox.innerHTML = html;
            }
        }
    } catch (err) {
        console.error("Error loading bookings:", err);
    }
}

    // Get OTP Button Interaction in Bookings
    const otpButtons = document.querySelectorAll(".status-otp");
    otpButtons.forEach(otpBtn => {
        otpBtn.addEventListener("click", () => {
            const randomOtp = Math.floor(100000 + Math.random() * 900000);
            alert(`Your Booking Verification OTP is: ${randomOtp}`);
        });
    });

    // Function to load dynamic bookings on page load
async function loadBookings() {
    try {
        const response = await fetch('http://localhost:5000/api/bookings');
        const data = await response.json();
        
        if (data.success && data.bookings.length > 0) {
            const bookingBoxes = document.querySelectorAll('.right-sidebar .card-box');
            if (bookingBoxes.length > 0) {
                const bookingBox = bookingBoxes[0]; // "My Bookings" card box
                let html = '<h4>My Bookings</h4>';
                
                data.bookings.forEach(b => {
                    html += `
                        <div class="booking-item" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 13px;">
                            <div><i class="fa-solid fa-calendar"></i> ${b.Equipments_name} (${b.duration} Days)</div>
                            <span class="status-otp" style="background:#e8f5e9; color:#2e7d32; padding:3px 8px; border-radius:4px; font-weight:600;">Confirmed</span>
                        </div>
                    `;
                });
                bookingBox.innerHTML = html;
            }
        }
    } catch (err) {
        console.error("Error loading bookings:", err);
    }
}

// Call on page load
document.addEventListener("DOMContentLoaded", () => {
    loadBookings();
});

                // Rent Now / View Details Interaction (Fixed Class Matches)
    document.addEventListener("click", (e) => {
        // Check for all class variations: btn-green, button-green, view-details-btn
        const btn = e.target.closest(".btn-green, .button-green, .view-details-btn");
        if (btn) {
            e.preventDefault();
            const card = btn.closest(".eq-card");
            if (card) {
                const titleElement = card.querySelector("h4") || card.querySelector("h3");
                const eqName = titleElement ? titleElement.textContent.trim() : "Equipment";
                
                // Modal elements update and display
                const modalEqName = document.getElementById("modalEqName");
                if (modalEqName) {
                    modalEqName.textContent = `Rent: ${eqName}`;
                }
                
                const modal = document.getElementById("rentalModal");
                if (modal) {
                    modal.style.display = "flex";
                }
            }
        }
    });

    // Proceed to Payment Gateway & Save Booking to Database
    document.getElementById("proceedToPayBtn")?.addEventListener("click", async () => {
        const duration = document.getElementById("rentalDuration").value;
        if (duration <= 0) {
            alert("Please enter a valid duration!");
            return;
        }

        // Equipments ka naam aur price modal se fetch karna
        const modalTitle = document.getElementById("modalEqName").textContent;
        const eqName = modalTitle.replace("Rent: ", "").trim();
        
        document.getElementById("rentalModal").style.display = "none";
        const confirmPayment = confirm(`Opening secure Payment Gateway for KrishiEquip.\nRental Duration: ${duration} Unit(s).\nProceed with test payment?`);
        
        if (confirmPayment) {
            try {
                // Backend API call to save booking
                const response = await fetch('http://localhost:5000/api/bookings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        farmer_id: 1, // Session ya localStorage se ID le sakte hain
                        Equipments_name: eqName,
                        duration: parseInt(duration),
                        total_amount: duration * 500 // Apne hisaab se calculation ya price set kar sakte hain
                    })
                });

                const data = await response.json();
                if (data.success) {
                    alert("Payment Successful! Your booking has been confirmed and saved.");
                    location.reload(); // Page refresh to update bookings list
                } else {
                    alert(data.message || "Failed to save booking.");
                }
            } catch (err) {
                console.error("Error saving booking:", err);
                alert("Server error during booking process.");
            }
        } else {
            alert("Payment cancelled.");
        }
    });

    //Support Section Interaction
    const supportItems = document.querySelectorAll(".support-item");
    supportItems.forEach(item => {
        item.addEventListener("click", (e) => {
            const actionText = e.currentTarget.textContent.trim();
            if (actionText.includes("Call Support")) {
                alert("Connecting to KrishiEquip Helpline: +91 7447019946");
            } else if (actionText.includes("Connect to Support")) {
                alert("Opening live chat support with an agricultural expert...");
            }
        });
    });
    async function loadEquipments() {
        try {
            const response = await fetch('http://localhost:5000/api/equipments');
            const data = await response.json();

            if ( data.success) {
                const equipmentsListContainer = document.querySelector(".equipments-grid");
                if(!equipmentsListContainer) return;
                equipmentsListContainer.innerHTML=" ";
                if(data.equipments.length === 0) {
                    equipmentsListContainer.innerHTML ="<p>No equipments available for the rent now.</p>";
                    return;
                }
                data.equipments.forEach(eq => {
                    const card = document.createElement("div");
                    card.className = "eq-card";
                    card.innerHTML = `
                    <h4>${eq.Equipments_name}</h4>
                    <p><strong>category: </strong> ${eq.category}</p>
                    <p><strong>Location: </strong> ${eq.location}</p>
                    <p><strong>Price: </strong> ${eq.price_per_day}</p>
                    <p>${eq.description || 'no description provided.'}</p>
                    <button class="button-green">Rent Now </button>
                    `;
                    equipmentsListContainer.appendChild(card);
                })
            }else {
                console.error("Failed to fetch Equipments");
            }
        } catch (err) {
            console.error("error connecting to the server", err);
        }
    }
    loadEquipments();
});