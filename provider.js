document.addEventListener("DOMContentLoaded", () => {
    // 1. Sidebar Menu Active State Switching
    const menuItems = document.querySelectorAll(".sidebar .menu li");
    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            menuItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
        });
    });

    // 2. Add New Equipment form Interaction
    const addEquipmentForm = document.querySelector("#addEquipmentForm");
    if(addEquipmentForm) {
        addEquipmentForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const provider_id = localStorage.getItem("user_id") || 1;
            const equipmentData = {
                provider_id: provider_id,
                equipment_name: document.querySelector("#equipmentName").value,
                category: document.querySelector("#equipmentCategory").value,
                price_per_day: document.querySelector("#equipmentPrice").value,
                location: document.querySelector("#equipmentLocation").value,
                description: document.querySelector("#equipmentDesc").value
            };

            try {
                const response = await fetch ('http://localhost:5000/api/equipments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'

                    },
                    body: JSON.stringify(equipmentData)
                });
                const data = await response.json();
                if(data.success) {
                    alert(data.message);
                    addEquipmentForm.reset();
                    loadProviderEquipments();

                } else {
                    alert(data.message || "Faiked to add equipment.");
                }
            } catch (err) {
                console.error("Error adding equipment:", err);
                alert("Server error while adding equipment.");
            }
        })
    }

    // 3. Edit Equipment Button Interaction
    const editButtons = document.querySelectorAll(".button-edit");
    editButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const card = e.target.closest(".equipment-card");
            const eqName = card ? card.querySelector("h4").textContent.trim() : "Equipment";
            alert(`Opening edit configuration for: ${eqName}`);
        });
    });

    // 4. Logout Button Action
    const logoutBtn = document.querySelector(".logout-button");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (confirm("Are you sure you want to log out?")) {
                alert("Logged out successfully.");
                window.location.href = "login.html"; // Redirects back to login page
            }
        });
    }
    // Function to Load Provider's Equipments Dynamically
    async function loadProviderEquipments() {
        try {
            const provider_id = localStorage.getItem("user_id") || 1;
            const response = await fetch(`http://localhost:5000/api/provider/equipments/${provider_id}`);
            const data = await response.json();

            if (data.success) {
                const grid = document.querySelector(".equipment-grid");
                if (!grid) return;

                if (data.equipments.length === 0) {
                    grid.innerHTML = "<p>No equipments added yet.</p>";
                    return;
                }

                grid.innerHTML = "";
                data.equipments.forEach(eq => {
                    const card = document.createElement("div");
                    card.className = "equipment-card";
                    
                    let badgeClass = "active";
                    let badgeText = "Available";
                    let badgeStyle = "";

                    if (eq.status === 'Pending') {
                        badgeStyle = "background: #fff3e0; color: #e65100;";
                        badgeText = "Pending Approval";
                    } else if (eq.status === 'Rented') {
                        badgeClass = "rented";
                        badgeText = "Currently Rented";
                    }

                    card.innerHTML = `
                        <div class="equipment-image" style="background-color: #e8f5e9;">
                            <i class="fa-solid fa-tractor" style="font-size: 50px; color: #2e7d32;"></i>
                        </div>
                        <div class="equipment-details">
                            <h4>${eq.equipment_name}</h4>
                            <p>${eq.category} - ${eq.location}</p>
                            <span class="badge ${badgeClass}" style="${badgeStyle}">${badgeText}</span>
                            <div class="equipment-footer">
                                <span class="price">₹${eq.price_per_day} / day</span>
                                <button class="button-edit"><i class="fa-solid fa-pen"></i> Edit</button>
                            </div>
                        </div>
                    `;
                    grid.appendChild(card);
                });
            }
        } catch (err) {
            console.error("Error loading provider equipments:", err);
        }
    }

    // Call on page load
    loadProviderEquipments();
});