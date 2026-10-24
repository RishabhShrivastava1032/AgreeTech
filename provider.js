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
                location: document.querySelector("equipmentLocation").value,
                description: document.querySelector("#equipmentDesc").value
            };

            try {
                const response = await fetch ('http://localhost:5000/api/equipment', {
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
});