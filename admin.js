// 1. Sidebar Menu Active State Switching & Dynamic View Loader
    const menuItems = document.querySelectorAll(".sidebar .menu li");
    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            menuItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            const menuText = item.textContent.trim();
            
            // Check which menu is clicked and load respective data
            if (menuText.includes("Users")) {
                if (typeof loadAdminUsers === "function") {
                    loadAdminUsers();
                }
            } else if (menuText.includes("Equipments") || menuText.includes("Dashboard")) {
                if (typeof loadAdminEquipments === "function") {
                    loadAdminEquipments();
                }
            }
        });
    });
// 2. Fetch and Display Pending Equipments for Admin Review
    async function loadAdminEquipments() {
        try {
            const response = await fetch('http://localhost:5000/api/admin/pending-equipments');
            const data = await response.json();

            if (data.success) {
                const tableBody = document.querySelector("tbody"); 
                
                if (!tableBody) return;

                tableBody.innerHTML = "";

                if (data.equipments.length === 0) {
                    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No pending equipment requests found.</td></tr>`;
                    return;
                }

                data.equipments.forEach(eq => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${eq.owner_name || 'Provider'}</td>
                        <td>${eq.equipment_name}</td>
                        <td>${eq.category}</td>
                        <td>₹${eq.price_per_day} / day</td>
                        <td><span class="status-badge pending" style="background: #fff3e0; color: #e65100; padding: 3px 8px; border-radius: 4px;">Pending</span></td>
                        <td>
                            <button onclick="updateStatus(${eq.id}, 'Approved')" class="button-approve" style="background:green; color:white; padding:5px 10px; border:none; border-radius:4px; cursor:pointer;">Approve</button>
                            <button onclick="updateStatus(${eq.id}, 'Rejected')" class="button-reject" style="background:red; color:white; padding:5px 10px; border:none; border-radius:4px; cursor:pointer; margin-left:5px;">Reject</button>
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

    // Call function on page load
    loadAdminEquipments();

    // 3. Load Admin Overview Stats (Top 4 Cards)
    async function loadAdminStats() {
        try {
            const response = await fetch('http://localhost:5000/api/admin/stats');
            const data = await response.json();

            if (data.success) {
                const cards = document.querySelectorAll(".admin-overview > div");
                if (cards.length >= 4) {
                    cards[0].querySelector("h2, p, span").textContent = data.totalUsers;
                    cards[1].querySelector("h2, p, span").textContent = data.activeEquipment;
                    cards[2].querySelector("h2, p, span").textContent = data.activeRentals;
                    cards[3].querySelector("h2, p, span").textContent = `Rs ${data.totalRevenue}`;
                }
            }
        } catch (err) {
            console.error("Error loading stats:", err);
        }
    }

    loadAdminStats();

    // 4. Fetch and Display Users for Management / Deletion
    window.loadAdminUsers = async function() {
        try {
            const response = await fetch('http://localhost:5000/api/admin/users');
            const data = await response.json();

            if (data.success) {
                const tableBody = document.querySelector("tbody");
                if (!tableBody) return;

                tableBody.innerHTML = "";

                if (data.users.length === 0) {
                    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No users found.</td></tr>`;
                    return;
                }

                data.users.forEach(user => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${user.id}</td>
                        <td>${user.full_name}</td>
                        <td>${user.email}</td>
                        <td>${user.mobile || 'N/A'}</td>
                        <td><span class="badge" style="background:#e8f5e9; color:#2e7d32; padding:3px 8px; border-radius:4px;">${user.role}</span></td>
                        <td>
                            <button onclick="deleteUser(${user.id})" style="background:red; color:white; padding:5px 10px; border:none; border-radius:4px; cursor:pointer;">Delete</button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
            }
        } catch (err) {
            console.error("Error loading users:", err);
        }
    };

    // 5. Global Delete User Function
    window.deleteUser = async function(id) {
        if (!confirm("Are you sure you want to delete this user?")) return;

        try {
            const response = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();

            if (data.success) {
                alert(data.message);
                loadAdminUsers();
            } else {
                alert(data.message || "Failed to delete user.");
            }
        } catch (err) {
            console.error("Error deleting user:", err);
            alert("Server error while deleting user.");
        }
    };

    // Global function to update status (Approve / Reject)
    window.updateStatus = async function(id, status) {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/equipment-status/${id}`, {
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

