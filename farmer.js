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
    const eqCards = document.querySelectorAll(".equipments-grid .eq-card");
    
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
            const cards = document.querySelectorAll(".equipments-grid .eq-card");

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
                            <div><i class="fa-solid fa-calendar"></i> ${b.equipments_name} (${b.duration} Days)</div>
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
                            <div><i class="fa-solid fa-calendar"></i> ${b.equipments_name} (${b.duration} Days)</div>
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

    // Enhanced Proceed to Payment Gateway & Save Payment + Booking
 document.getElementById("proceedToPayBtn")?.addEventListener("click", async () => {
     const duration = document.getElementById("rentalDuration")?.value || 1;
     if (duration <= 0) {
         alert("Please enter a valid duration!");
         return;
     }

     const modalTitle = document.getElementById("modalEqName")?.textContent || "Tractor";
     const eqName = modalTitle.replace("Rent: ", "").replace("Rent Equipment", "").trim();
     const totalAmount = duration * 500; // Ya apne price calculation ke mutabiq

     // Modal hide karein
     const modal = document.getElementById("rentalModal");
     if (modal) modal.style.display = "none";

     const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || "UPI";
     const loggedInUserId = localStorage.getItem("user_id") || 1;

     try {
         const response = await fetch('http://localhost:5000/api/payments/process', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
                 farmer_id: parseInt(loggedInUserId),
                 equipment_name: eqName,
                 duration: parseInt(duration),
                 total_amount: totalAmount,
                 payment_method: selectedMethod
             })
         });

         const data = await response.json();
         if (data.success) {
             alert(` Payment Successful!\n\nTransaction ID: ${data.payment.transaction_id}\nAmount Paid: ₹${totalAmount}`);
             location.reload(); // Refresh to update booking & payment history
         } else {
             alert(data.message || "Failed to process payment.");
         }
     } catch (err) {
         console.error("Payment Submission Error:", err);
         alert("Server error during payment process.");
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
                const equipmentsListContainer = document.querySelector(".equipment-grid");
                if(!equipmentsListContainer) return;
                equipmentsListContainer.innerHTML=" ";
                if(data.equipments.length === 0) {
                    equipmentsListContainer.innerHTML ="<p>No equipments available for the rent now.</p>";
                    return;
                }
data.equipments.forEach(eq => {
    const card = document.createElement("div");
    card.className = "eq-card"; // Yeh CSS ki original class hai
    card.innerHTML = `
        <div class="eq-img" style="background-color: #ffebee;">
            <i class="fa-solid fa-tractor" style="font-size: 50px; color: #d32f2f;"></i>
        </div>
        <div class="eq-details">
            <h4>${eq.equipment_name}</h4>
            <p>${eq.category} - ${eq.location}</p>
            <span class="badge">Available</span>
            <div class="eq-footer">
                <span class="price">₹${eq.price_per_day} / day</span>
                <button class="button-green">Rent Now</button>
            </div>
        </div>
    `;
    equipmentsListContainer.appendChild(card);
});
            }else {
                console.error("Failed to fetch Equipments");
            }
        } catch (err) {
            console.error("error connecting to the server", err);
        }
    }
    loadEquipments();
});