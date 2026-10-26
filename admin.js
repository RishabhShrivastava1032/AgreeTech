document.addEventListener("DOMContentLoaded", () => {
    // 1. Sidebar Menu Active State Switching
    const menuItems = document.querySelectorAll(".sidebar .menu li");
    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            menuItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
        });
    });

   // 2. Fetch and Display All Equipments for Admin Review (Backend Connected)
    async function loadAdminEquipments() {
        try {
            const response = await fetch('http://localhost:5000/api/admin/equipments');
            const data = await response.json();

            if (data.success) {
                const tableBody = document.querySelector("tbody"); // Apne admin table ka tbody
                
                if (!tableBody) return;

                tableBody.innerHTML = "";

                if (data.equipments.length === 0) {
                    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No equipment requests found.</td></tr>`;
                    return;
                }

                data.equipments.forEach(eq => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${eq.provider_name || 'Provider'}</td>
                        <td>${eq.equipment_name}</td>
                        <td>${eq.category}</td>
                        <td>₹${eq.price_per_day} / day</td>
                        <td><span class="status-badge ${eq.status.toLowerCase()}">${eq.status}</span></td>
                        <td>
                            ${eq.status === 'Pending' ? `
                                <button onclick="updateStatus(${eq.id}, 'Approved')" class="button-approve" style="background:green; color:white; padding:5px 10px; border:none; border-radius:4px; cursor:pointer;">Approve</button>
                                <button onclick="updateStatus(${eq.id}, 'Rejected')" class="button-reject" style="background:red; color:white; padding:5px 10px; border:none; border-radius:4px; cursor:pointer; margin-left:5px;">Reject</button>
                            ` : `<span>Processed</span>`}
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
            } else {
                console.error("Failed to load admin equipments");
            }
        } catch (err) {
            console.error("Error connecting to server:", err);
        }
    }

    // Global function to update status (Approve / Reject)
    window.updateStatus = async function(id, status) {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/equipments/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            const data = await response.json();
            if (data.success) {
                alert(data.message);
                loadAdminEquipments(); // Refresh table
            } else {
                alert(data.message || "Failed to update status.");
            }
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Server error while updating status.");
        }
    }

    const logoutBtn = document.querySelector(".logout-button");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (confirm("Are you sure you want to log out as Admin?")) {
                alert("Logged out successfully.");
                window.location.href = "login.html";
            }
        });
    }
});
