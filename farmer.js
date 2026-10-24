document.addEventListener("DOMContentLoaded", () => {
    // Sidebar Active State Switching
    const sidebarItems = document.querySelectorAll(".sidebar .menu li");
    sidebarItems.forEach(item => {
        item.addEventListener("click", () => {
            sidebarItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
        });
    });
    
    // 1. Live Search Bar Functionality
    const searchInput = document.querySelector(".search-bar input");
    const eqCards = document.querySelectorAll(".equipment-grid .eq-card");
    
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

    // 2. Filter Equipment by Category
    const filterButtons = document.querySelectorAll(".btn-filter");
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const category = btn.textContent.trim().toLowerCase();
            const cards = document.querySelectorAll(".equipment-grid .eq-card");

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
//------------------------------------------------------------start check from here ---------------------------------------------------------------------------------------
//=======================================================================================================================================================================================
    // 3. Rent Now / View Details Interaction
    const actionButtons = document.querySelectorAll(".btn-green, .view-details-btn");
    actionButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const card = e.target.closest(".eq-card");
            if (card) {
                const titleElement = card.querySelector("h4") || card.querySelector("h3");
                const eqName = titleElement ? titleElement.textContent.trim() : "Equipment";
                alert(`Redirecting to booking & rental details for: ${eqName}`);
            }
        });
    });

    // 4. Get OTP Button Interaction in Bookings
    const otpButtons = document.querySelectorAll(".status-otp");
    otpButtons.forEach(otpBtn => {
        otpBtn.addEventListener("click", () => {
            const randomOtp = Math.floor(100000 + Math.random() * 900000);
            alert(`Your Booking Verification OTP is: ${randomOtp}`);
        });
    });

    // 5. Support Section Interaction
    const supportItems = document.querySelectorAll(".support-item");
    supportItems.forEach(item => {
        item.addEventListener("click", (e) => {
            const actionText = e.currentTarget.textContent.trim();
            if (actionText.includes("Call Support")) {
                alert("Connecting to KrishiEquip Helpline: +91 9876543210");
            } else if (actionText.includes("Connect to Support")) {
                alert("Opening live chat support with an agricultural expert...");
            }
        });
    });
    async function loadEquipment() {
        try {
            const response = await fetch('http://localhost:5000/api/equipment');
            const data = await response.json();

            if ( data.success) {
                const equipmentListContainer = document.querySelector(".equipment-grid");
                if(!equipmentListContainer) return;
                equipmentListContainer.innerHTML=" ";
                if(data.equipment.length === 0) {
                    equipmentListContainer.innerHTML ="<p>No equipment available for the rent now.</p>";
                    return;
                }
                data.equipment.forEach(eq => {
                    const card = document.createElement("div");
                    card.className = "eq-card";
                    card.innerHTML = `
                    <h4>$ {eq.equipment_name}</h4>
                    <p><strong>category: </strong> ${eq.category}</p>
                    <p><strong>Location: </strong> ${eq.location}</p>
                    <p><strong>Price: </strong> ${eq.price_per_day}</p>
                    <p>${eq.description || 'no description provided.'}</p>
                    <button class="button-green">Rent Now </button>
                    `;
                    equipmentListContainer.appendChild(card);
                })
            }else {
                console.error("Failed to fetch equipment");
            }
        } catch (err) {
            console.error("error connecting to the server", err);
        }
    }
    loadEquipment();
});